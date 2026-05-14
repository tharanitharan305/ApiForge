import { GeneratedFile } from '@apiforge/core';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalFiles: number;
    emptyFiles: number;
    duplicateNames: number;
  };
}

export interface CorruptionCheckResult {
  hasCorruption: boolean;
  issues: {
    type: 'raw_boolean' | 'unresolved_template' | 'undefined_variable' | 'wrong_extension' | 'missing_code';
    message: string;
    line?: number;
    snippet?: string;
  }[];
}

/**
 * Validates generated SDK files before export
 */
export class GeneratorValidator {
  /**
   * Comprehensive validation including corruption detection
   */
  static validate(files: GeneratedFile[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const stats = {
      totalFiles: files.length,
      emptyFiles: 0,
      duplicateNames: 0,
    };

    // Check if any files were generated
    if (files.length === 0) {
      errors.push('No files were generated');
      return { valid: false, errors, warnings, stats };
    }

    // Track filenames to detect duplicates
    const filenames = new Set<string>();
    const duplicates = new Set<string>();

    for (const file of files) {
      // Check for empty files
      if (!file.content || file.content.trim().length === 0) {
        errors.push(`Empty file: ${file.filename}`);
        stats.emptyFiles++;
      }

      // Check for placeholder/TODO content
      if (file.content.includes('TODO: Implement')) {
        warnings.push(`Incomplete implementation: ${file.filename}`);
      }

      // Check for duplicate filenames
      if (filenames.has(file.filename)) {
        errors.push(`Duplicate filename: ${file.filename}`);
        duplicates.add(file.filename);
      }
      filenames.add(file.filename);

      // Check for missing required fields
      if (!file.language) {
        errors.push(`Missing language for file: ${file.filename}`);
      }

      // CRITICAL: Check for corruption
      const corruptionCheck = this.detectCorruption(file);
      if (corruptionCheck.hasCorruption) {
        for (const issue of corruptionCheck.issues) {
          errors.push(`${file.filename}: ${issue.type} - ${issue.message}${issue.snippet ? `\n  Snippet: ${issue.snippet}` : ''}`);
        }
      }

      // Language-specific validation
      this.validateLanguageSyntax(file, errors, warnings);
    }

    stats.duplicateNames = duplicates.size;

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats,
    };
  }

  /**
   * Detect corruption in generated files
   * This is the CRITICAL validation that prevents corrupted exports
   */
  static detectCorruption(file: GeneratedFile): CorruptionCheckResult {
    const issues: CorruptionCheckResult['issues'] = [];
    const lines = file.content.split('\n');

    // 1. Check for raw boolean leakage (truefalsefalse pattern)
    const rawBooleanPattern = /\b(true|false|null|undefined)\s*(true|false|null|undefined)/gi;
    lines.forEach((line, idx) => {
      const match = line.match(rawBooleanPattern);
      if (match) {
        issues.push({
          type: 'raw_boolean',
          message: `Raw boolean values leaked into code`,
          line: idx + 1,
          snippet: line.trim().substring(0, 80),
        });
      }
    });

    // 2. Check for unresolved Handlebars templates
    const unresolvedTemplatePattern = /\{\{[^}]+\}\}/g;
    lines.forEach((line, idx) => {
      const match = line.match(unresolvedTemplatePattern);
      if (match) {
        issues.push({
          type: 'unresolved_template',
          message: `Unresolved template variable: ${match[0]}`,
          line: idx + 1,
          snippet: line.trim().substring(0, 80),
        });
      }
    });

    // 3. Check for undefined variable usage (language-specific)
    if (file.language === 'dart') {
      // Check for 'response' usage without definition
      const hasResponseUsage = file.content.includes('return ApiResponse.fromResponse(\n  response,') ||
                               file.content.includes('return ApiResponse.fromResponse(response,');
      const hasResponseDefinition = file.content.includes('final response = await') ||
                                    file.content.includes('var response = await');
      
      if (hasResponseUsage && !hasResponseDefinition) {
        issues.push({
          type: 'undefined_variable',
          message: `Variable 'response' used but never defined`,
        });
      }

      // Check for missing HTTP request generation
      if (file.filename.startsWith('collections/')) {
        const hasHttpMethod = /await _client\.(get|post|put|patch|delete)\(/.test(file.content);
        if (!hasHttpMethod && file.content.includes('static Future<ApiResponse')) {
          issues.push({
            type: 'missing_code',
            message: `HTTP request generation missing in collection method`,
          });
        }
      }
    }

    if (file.language === 'typescript') {
      // Check for 'response' usage without definition
      const hasResponseUsage = file.content.includes('normalizeResponse(response)');
      const hasResponseDefinition = file.content.includes('response = await ApiClient.');
      
      if (hasResponseUsage && !hasResponseDefinition) {
        issues.push({
          type: 'undefined_variable',
          message: `Variable 'response' used but never defined`,
        });
      }
    }

    // 4. Check for wrong file extension (TypeScript should be .tsx for collections/models)
    if (file.language === 'typescript') {
      // Collections and models should be .tsx, core files can be .ts
      if ((file.filename.startsWith('collections/') || file.filename.startsWith('models/')) && 
          file.filename.endsWith('.ts') && !file.filename.endsWith('.tsx')) {
        issues.push({
          type: 'wrong_extension',
          message: `TypeScript collection/model file should use .tsx extension, got .ts`,
        });
      }
    }

    return {
      hasCorruption: issues.length > 0,
      issues,
    };
  }

  /**
   * Validate language-specific syntax patterns
   */
  private static validateLanguageSyntax(
    file: GeneratedFile,
    errors: string[],
    warnings: string[],
  ): void {
    const { content, filename, language } = file;

    switch (language) {
      case 'dart':
        // Check for basic Dart syntax
        if (!content.includes('class ') && !content.includes('import ')) {
          warnings.push(`${filename}: Missing class or import declarations`);
        }
        break;

      case 'typescript':
        // Check for basic TS syntax
        if (!content.includes('export ') && !content.includes('import ')) {
          warnings.push(`${filename}: Missing export or import declarations`);
        }
        break;

      case 'javascript':
        // Check for basic JS syntax
        if (!content.includes('class ') && !content.includes('module.exports') && !content.includes('export ')) {
          warnings.push(`${filename}: Missing class or export declarations`);
        }
        break;

      case 'python':
        // Check for basic Python syntax
        if (!content.includes('class ') && !content.includes('def ') && !content.includes('import ')) {
          warnings.push(`${filename}: Missing class, function, or import declarations`);
        }
        break;
    }
  }

  /**
   * Validate collection structure
   */
  static validateCollectionStructure(files: GeneratedFile[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const hasCollections = files.some(f => f.filename.startsWith('collections/'));
    const hasModels = files.some(f => f.filename.startsWith('models/'));
    const hasCore = files.some(f => f.filename.startsWith('core/'));
    const hasIndex = files.some(f => f.filename === 'index.dart' || f.filename === 'index.ts' || f.filename === 'index.js' || f.filename === '__init__.py');

    if (!hasCollections) {
      errors.push('Missing collections directory');
    }

    if (!hasModels) {
      warnings.push('No models generated');
    }

    if (!hasCore) {
      errors.push('Missing core directory (api_client, api_response)');
    }

    if (!hasIndex) {
      warnings.push('No index file generated');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalFiles: files.length,
        emptyFiles: 0,
        duplicateNames: 0,
      },
    };
  }
}

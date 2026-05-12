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

/**
 * Validates generated SDK files before export
 */
export class GeneratorValidator {
  /**
   * Validate all generated files
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

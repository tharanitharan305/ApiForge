import requests
from typing import Any, Optional, Dict


class ApiResponse:
    """Normalized API Response"""
    
    def __init__(
        self,
        success: bool,
        message: str,
        data: Optional[Any] = None,
        status_code: Optional[int] = None
    ):
        self.success = success
        self.message = message
        self.data = data
        self.status_code = status_code
    
    def __str__(self) -> str:
        return f"ApiResponse(success={self.success}, message={self.message}, status_code={self.status_code})"
    
    def __repr__(self) -> str:
        return self.__str__()


def normalize_response(response: requests.Response) -> ApiResponse:
    """Normalize requests response to ApiResponse format"""
    try:
        data = response.json()
        
        # Extract fields based on response mapping
        success = data.get('success', 200 <= response.status_code < 300)
        message = data.get('message', '')
        response_data = data.get('data', data)
        status_code = data.get('statusCode', response.status_code)
        
        return ApiResponse(
            success=success,
            message=message,
            data=response_data,
            status_code=status_code
        )
    except Exception as e:
        return ApiResponse(
            success=False,
            message=f"Failed to parse response: {str(e)}",
            data=None,
            status_code=response.status_code
        )

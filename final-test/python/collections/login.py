import requests
from typing import Optional, Dict, Any
from ..core.api_client import ApiClient
from ..core.api_response import ApiResponse, normalize_response
from ..models.login_models import *


class Login:
    """
    login Collection
    
    Base Path: /auth
    """
    
    @staticmethod
    def create_account(
        body: Optional['CreateAccountBody'] = None,
        headers: Optional['CreateAccountHeaders'] = None,
    ) -> ApiResponse:
        """
        createAccount
        
        Endpoint: /auth/createAccount
        """
        query_params = {}
        
        url = ApiClient.build_url('/auth/createAccount', query_params)
        
        request_headers = {
            'Content-Type': 'application/json',
        }
        
        if headers is not None:
            request_headers.update(headers.to_dict())
        
        method = 'POST'
        if method == 'GET':
            response = ApiClient.get(url, headers=request_headers)
        elif method == 'POST':
            response = ApiClient.post(
                url,
                json=body.to_dict() if body else None,
                headers=request_headers
            )
        elif method == 'PUT':
            response = ApiClient.put(
                url,
                json=body.to_dict() if body else None,
                headers=request_headers
            )
        elif method == 'PATCH':
            response = ApiClient.patch(
                url,
                json=body.to_dict() if body else None,
                headers=request_headers
            )
        elif method == 'DELETE':
            response = ApiClient.delete(url, headers=request_headers)
        
        return normalize_response(response)
    

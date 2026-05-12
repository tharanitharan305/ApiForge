"""
Models for login Collection
"""

from typing import Optional, Dict, Any


class CreateAccountBody:
    """Request body for createAccount"""
    
    def __init__(
        self,
        user_id: Optional[str] = None,
        summary_ref: Optional[str] = None,
        note_content: Optional[str] = None,
    ):
        self.user_id = user_id
        self.summary_ref = summary_ref
        self.note_content = note_content
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'user_id': self.user_id,
            'summaryRef': self.summary_ref,
            'note_content': self.note_content,
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CreateAccountBody':
        return cls(
            user_id=data.get('user_id'),
            summary_ref=data.get('summaryRef'),
            note_content=data.get('note_content'),
        )


class CreateAccountHeaders:
    """Headers for createAccount"""
    
    def __init__(
        self,
    ):
    
    def to_dict(self) -> Dict[str, str]:
        headers = {}
        return headers


class CreateAccountResponse:
    """Response for createAccount"""
    
    def __init__(self, data: Dict[str, Any]):
        self.data = data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CreateAccountResponse':
        return cls(data)
    
    def to_dict(self) -> Dict[str, Any]:
        return self.data



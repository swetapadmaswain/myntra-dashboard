"""
PII Masker
Detects and masks personally identifiable information
"""

import re


class PIIMasker:
    """PII detection and masking utilities"""
    
    # Patterns for PII detection
    EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    PHONE_PATTERN = r'\b(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\b'
    USERNAME_PATTERN = r'@[\w]+'
    IP_ADDRESS_PATTERN = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
    
    @staticmethod
    def mask_email(text: str, mask_char: str = '*') -> str:
        """
        Mask email addresses in text
        
        Args:
            text: Text containing emails
            mask_char: Character to use for masking
            
        Returns:
            Text with masked emails
        """
        def mask_email_match(match):
            email = match.group()
            parts = email.split('@')
            username = parts[0]
            domain = parts[1]
            # Keep first 2 chars of username, mask rest
            masked_username = username[:2] + mask_char * (len(username) - 2)
            return f"{masked_username}@{domain}"
        
        return re.sub(PIIMasker.EMAIL_PATTERN, mask_email_match, text)
    
    @staticmethod
    def mask_phone(text: str, mask_char: str = '*') -> str:
        """
        Mask phone numbers in text
        
        Args:
            text: Text containing phone numbers
            mask_char: Character to use for masking
            
        Returns:
            Text with masked phone numbers
        """
        def mask_phone_match(match):
            phone = match.group()
            # Keep last 4 digits, mask rest
            return mask_char * (len(phone) - 4) + phone[-4:]
        
        return re.sub(PIIMasker.PHONE_PATTERN, mask_phone_match, text)
    
    @staticmethod
    def mask_username(text: str, mask_char: str = '*') -> str:
        """
        Mask usernames in text
        
        Args:
            text: Text containing usernames
            mask_char: Character to use for masking
            
        Returns:
            Text with masked usernames
        """
        def mask_username_match(match):
            username = match.group()
            # Keep first char, mask rest
            return username[0] + mask_char * (len(username) - 1)
        
        return re.sub(PIIMasker.USERNAME_PATTERN, mask_username_match, text)
    
    @staticmethod
    def mask_ip_address(text: str, mask_char: str = '*') -> str:
        """
        Mask IP addresses in text
        
        Args:
            text: Text containing IP addresses
            mask_char: Character to use for masking
            
        Returns:
            Text with masked IP addresses
        """
        def mask_ip_match(match):
            ip = match.group()
            parts = ip.split('.')
            # Keep first octet, mask rest
            return f"{parts[0]}.{mask_char}.{mask_char}.{mask_char}"
        
        return re.sub(PIIMasker.IP_ADDRESS_PATTERN, mask_ip_match, text)
    
    @staticmethod
    def mask_all(text: str, mask_char: str = '*') -> str:
        """
        Mask all PII in text
        
        Args:
            text: Text containing PII
            mask_char: Character to use for masking
            
        Returns:
            Text with all PII masked
        """
        text = PIIMasker.mask_email(text, mask_char)
        text = PIIMasker.mask_phone(text, mask_char)
        text = PIIMasker.mask_username(text, mask_char)
        text = PIIMasker.mask_ip_address(text, mask_char)
        return text

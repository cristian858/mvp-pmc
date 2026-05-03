"""
Servicio de procesamiento de documentos (PDF)
"""
import os
from PyPDF2 import PdfReader


class DocumentProcessor:
    """Servicio para procesar documentos PDF"""
    
    @staticmethod
    def extract_text_from_pdf(filepath):
        """
        Extrae texto de un archivo PDF
        
        Args:
            filepath (str): Ruta del archivo PDF
        
        Returns:
            dict: {'success': bool, 'text': str, 'error': str, 'num_pages': int}
        """
        try:
            if not os.path.exists(filepath):
                return {
                    'success': False,
                    'text': None,
                    'error': f'Archivo no encontrado: {filepath}',
                    'num_pages': 0
                }
            
            if not filepath.lower().endswith('.pdf'):
                return {
                    'success': False,
                    'text': None,
                    'error': 'El archivo no es un PDF',
                    'num_pages': 0
                }
            
            reader = PdfReader(filepath)
            num_pages = len(reader.pages)
            text = ''
            
            for page in reader.pages:
                text += page.extract_text()
            
            if not text:
                return {
                    'success': False,
                    'text': None,
                    'error': 'No se pudo extraer texto del PDF',
                    'num_pages': num_pages
                }
            
            return {
                'success': True,
                'text': text,
                'error': None,
                'num_pages': num_pages
            }
        
        except Exception as e:
            return {
                'success': False,
                'text': None,
                'error': f'Error extrayendo texto: {str(e)}',
                'num_pages': 0
            }
    
    @staticmethod
    def extract_first_page_preview(filepath, max_chars=500):
        """
        Extrae un preview de la primera página
        
        Args:
            filepath (str): Ruta del PDF
            max_chars (int): Máximo de caracteres
        
        Returns:
            str: Preview del contenido
        """
        result = DocumentProcessor.extract_text_from_pdf(filepath)
        if result['success']:
            text = result['text'][:max_chars]
            return text if len(result['text']) <= max_chars else text + '...'
        return ''


# Instancia global
document_processor = DocumentProcessor()

"""
Servicio de análisis con IA
Soporta mock (análisis simple) y real (OpenAI/Claude API)
"""
import re
import json


class AIAnalyzer:
    """Servicio de análisis inteligente de contratos"""
    
    def __init__(self, use_mock=True, openai_key=None, claude_key=None):
        self.use_mock = use_mock
        self.openai_key = openai_key
        self.claude_key = claude_key
    
    def analyze_contract(self, text):
        """
        Analiza un contrato y retorna resumen, riesgos y obligaciones
        
        Args:
            text (str): Texto del contrato
        
        Returns:
            dict: {'resumen': str, 'obligaciones': list, 'riesgos': list, 'puntos_clave': list}
        """
        if self.use_mock:
            return self._mock_analysis(text)
        else:
            return self._real_analysis(text)
    
    def _mock_analysis(self, text):
        """
        Análisis mock: usa patrones simples y regex
        Útil para demostración y testing
        """
        text_lower = text.lower()
        
        # Detectar tipo de contrato
        contrato_tipo = self._detect_contract_type(text)
        
        # Resumen automático (primeras líneas relevantes)
        resumen = self._extract_summary(text)
        
        # Detectar palabras clave de obligaciones
        obligaciones = self._extract_obligations(text)
        
        # Detectar palabras clave de riesgos
        riesgos = self._extract_risks(text)
        
        # Puntos clave
        puntos_clave = self._extract_key_points(text)
        
        return {
            'resumen': resumen,
            'obligaciones': obligaciones,
            'riesgos': riesgos,
            'puntos_clave': puntos_clave,
            'tipo_contrato': contrato_tipo,
            'metodo': 'mock'
        }
    
    def _detect_contract_type(self, text):
        """Detecta el tipo de contrato basado en palabras clave"""
        keywords = {
            'Contrato de Compraventa': ['compraventa', 'vender', 'buyer', 'seller', 'precio', 'bien'],
            'Contrato de Servicios': ['servicios', 'prestación', 'prestador', 'cliente', 'tarifa'],
            'Contrato de Arrendamiento': ['arrendador', 'arrendatario', 'alquiler', 'renta', 'propiedad'],
            'Contrato de Empleo': ['empleado', 'empleador', 'salario', 'jornada', 'contratación'],
            'Acuerdo de Confidencialidad': ['confidencial', 'secreto', 'nda', 'información'],
            'Contrato de Préstamo': ['préstamo', 'deudor', 'acreedor', 'interés', 'cuota']
        }
        
        text_lower = text.lower()
        for tipo, palabras in keywords.items():
            if sum(1 for p in palabras if p in text_lower) >= 3:
                return tipo
        
        return 'Contrato genérico'
    
    def _extract_summary(self, text):
        """Extrae un resumen del contrato"""
        lines = text.split('\n')
        # Tomar las primeras líneas relevantes (que no sean muy cortas)
        summary_lines = [l.strip() for l in lines[:10] if len(l.strip()) > 20]
        summary = ' '.join(summary_lines)
        return summary[:300] + '...' if len(summary) > 300 else summary
    
    def _extract_obligations(self, text):
        """Extrae obligaciones del contrato"""
        patterns = [
            r'(?:debe|deberá|está obligado.*?):\s*(.+?)(?:\.|,)',
            r'El.*?(?:debe|deberá).*?(.+?)(?:\.|,)',
            r'(?:obligaciones|compromisos).*?:\s*(.+?)(?:\.|;)',
            r'(?:acuerda|acepta).*?(.+?)(?:\.|,)'
        ]
        
        obligaciones = []
        text_lower = text.lower()
        
        # Palabras clave de obligación
        keywords = [
            'debe', 'deberá', 'obligado', 'compromete', 'acuerda', 'garantiza',
            'responsable', 'garantiza', 'mantiene', 'proporciona'
        ]
        
        for keyword in keywords:
            if keyword in text_lower:
                obligaciones.append(f'- Obligación relacionada con "{keyword}"')
        
        # Limitar a 5 obligaciones principales
        return obligaciones[:5] if obligaciones else ['- Obligaciones no claramente identificadas']
    
    def _extract_risks(self, text):
        """Detecta cláusulas de riesgo en el contrato"""
        risk_keywords = [
            ('Limitación de responsabilidad', ['limitación', 'responsabilidad', 'limitada']),
            ('Penalidades', ['penalidad', 'multa', 'daños', 'perjuicios']),
            ('Resolución del contrato', ['resolución', 'terminar', 'cancelación', 'rescisión']),
            ('Modificaciones unilaterales', ['unilateral', 'modificar', 'cambiar', 'ajustar']),
            ('Confidencialidad violada', ['confidencial', 'secreto', 'privado', 'no divulgar']),
            ('Jurisdicción y ley aplicable', ['jurisdicción', 'ley aplicable', 'tribunales', 'arbitraje']),
            ('Incumplimiento', ['incumplimiento', 'default', 'no cumple', 'falta']),
        ]
        
        riesgos = []
        text_lower = text.lower()
        
        for riesgo_nombre, palabras in risk_keywords:
             if any(palabra in text_lower for palabra in palabras):
                 riesgos.append(f'AVISO: {riesgo_nombre}')
        
        return riesgos if riesgos else ['No se detectaron riesgos evidentes (revisar manualmente)']
    
    def _extract_key_points(self, text):
        """Extrae puntos clave del contrato"""
        puntos = []
        
        # Buscar montos económicos
        montos = re.findall(r'\$\s*[\d,]+(?:\.\d{2})?|USD\s*[\d,]+(?:\.\d{2})?', text)
        if montos:
            puntos.append(f'[AMOUNT] Monto(s) mencionado(s): {", ".join(montos[:3])}')
        
        # Buscar fechas
        fechas = re.findall(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', text)
        if fechas:
            puntos.append(f'[DATE] Fecha(s): {fechas[0]}')
        
        # Buscar duración
        if 'año' in text.lower() or 'años' in text.lower():
            puntos.append('[TIME] Duración: Especificada en años')
        
        if 'mes' in text.lower() or 'meses' in text.lower():
            puntos.append('[TIME] Duración: Especificada en meses')
        
        return puntos if puntos else ['- Puntos clave no identificados']
    
    def _real_analysis(self, text):
        """
        Análisis real usando OpenAI o Claude API
        (A implementar con claves API reales)
        """
        return {
            'resumen': 'Análisis real no configurado. Use USE_MOCK_AI=true o configure OPENAI_API_KEY/CLAUDE_API_KEY',
            'obligaciones': [],
            'riesgos': [],
            'puntos_clave': [],
            'metodo': 'real (no disponible)'
        }


# Instancia global
ai_analyzer = AIAnalyzer(use_mock=True)

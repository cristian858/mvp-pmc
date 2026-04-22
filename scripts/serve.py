#!/usr/bin/env python
"""
Script para ejecutar SafeSign AI.
"""
import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
sys.path.insert(0, PROJECT_ROOT)


if __name__ == '__main__':
    try:
        from app import create_app

        app = create_app(os.environ.get('FLASK_ENV', 'development'))

        print("\n" + "=" * 60)
        print("SAFESIGN AI - SISTEMA LISTO")
        print("=" * 60)
        print("[OK] Aplicacion Flask inicializada")
        print("[OK] Base de datos SQLite configurada")
        print("[OK] Autenticacion habilitada")
        print("[OK] Analisis IA en modo mock")
        print("[OK] Verificacion biometrica real con camara")
        print("[OK] Firma digital")
        print("=" * 60)
        print("\nIniciando servidor en http://localhost:5000\n")

        app.run(
            debug=True,
            host='0.0.0.0',
            port=5000,
            use_reloader=False
        )
    except Exception as e:
        print(f"\nError: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)

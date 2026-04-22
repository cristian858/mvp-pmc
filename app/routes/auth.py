"""
Rutas de autenticación (login, registro, logout)
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, current_user, login_required
from app.services.auth import auth_service
from app.models.database import User

bp = Blueprint('auth', __name__, url_prefix='')


@bp.route('/register', methods=['GET', 'POST'])
def register():
    """Registro de nuevo usuario"""
    if current_user.is_authenticated:
        return redirect(url_for('documents.dashboard'))
    
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        password_confirm = request.form.get('password_confirm', '')
        
        result = auth_service.register_user(name, email, password, password_confirm)
        
        if result['success']:
            login_user(result['user'])
            flash('¡Registro exitoso! Bienvenido a SafeSign AI.', 'success')
            return redirect(url_for('documents.dashboard'))
        else:
            flash(f'Error: {result["error"]}', 'error')
    
    return render_template('register.html')


@bp.route('/login', methods=['GET', 'POST'])
def login():
    """Login de usuario"""
    if current_user.is_authenticated:
        return redirect(url_for('documents.dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        
        result = auth_service.login_user(email, password)
        
        if result['success']:
            login_user(result['user'])
            flash(f'¡Bienvenido, {result["user"].name}!', 'success')
            return redirect(url_for('documents.dashboard'))
        else:
            flash(f'Error: {result["error"]}', 'error')
    
    return render_template('login.html')


@bp.route('/logout')
@login_required
def logout():
    """Logout de usuario"""
    logout_user()
    flash('Has cerrado sesión.', 'info')
    return redirect(url_for('auth.login'))

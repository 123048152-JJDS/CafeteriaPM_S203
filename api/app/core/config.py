from decouple import config

def get_db_config():
    return {
        'user': config('DB_USER'),
        'password': config('DB_PASSWORD'),
        'host': config('DB_HOST'),
        'port': config('DB_PORT', default='5432'),
        'db': config('DB_NAME'),
    }

# Variables de configuración de JWT (usadas en security.py)
SECRET_KEY = config('SECRET_KEY')
ALGORITHM = config('ALGORITHM', default='HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = config('ACCESS_TOKEN_EXPIRE_MINUTES', default=480, cast=int)

# Settings (usadas en main.py)
class Settings:
    APP_NAME: str = config('APP_NAME', default='CafeteriaPM API')
    APP_VERSION: str = config('APP_VERSION', default='1.0.0')
    ENVIRONMENT: str = config('ENVIRONMENT', default='development')
    DEBUG: bool = config('DEBUG', default=True, cast=bool)

settings = Settings()
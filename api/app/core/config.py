from decouple import config, UndefinedValueError


def get_db_config():
    return {
        "host":     config("DB_HOST"),
        "user":     config("DB_USER"),
        "password": config("DB_PASSWORD"),
        "db":       config("DB_NAME"),
        "port":     config("DB_PORT", default=5432, cast=int),
    }


def get_app_config():
    return {
        "secret_key":                   config("SECRET_KEY"),
        "algorithm":                    config("ALGORITHM",                      default="HS256"),
        "access_token_expire_minutes":  config("ACCESS_TOKEN_EXPIRE_MINUTES",   default=480, cast=int),
        "app_name":                     config("APP_NAME",                       default="CafeteriaPM API"),
        "app_version":                  config("APP_VERSION",                    default="1.0.0"),
        "environment":                  config("ENVIRONMENT",                    default="development"),
        "debug":                        config("DEBUG",                          default=True, cast=bool),
    }

class _Settings:
    def __init__(self):
        _db  = get_db_config()
        _app = get_app_config()

        self.DB_HOST     = _db["host"]
        self.DB_USER     = _db["user"]
        self.DB_PASSWORD = _db["password"]
        self.DB_NAME     = _db["db"]
        self.DB_PORT     = _db["port"]

        self.SECRET_KEY                  = _app["secret_key"]
        self.ALGORITHM                   = _app["algorithm"]
        self.ACCESS_TOKEN_EXPIRE_MINUTES = _app["access_token_expire_minutes"]
        self.APP_NAME                    = _app["app_name"]
        self.APP_VERSION                 = _app["app_version"]
        self.ENVIRONMENT                 = _app["environment"]
        self.DEBUG                       = _app["debug"]


settings = _Settings()

if __name__ == "__main__":
    try:
        cfg = get_db_config()
        print(f"host:     {cfg['host']}")
        print(f"user:     {cfg['user']}")
        print(f"password: {'*' * len(cfg['password'])}")
        print(f"db:       {cfg['db']}")
        print(f"port:     {cfg['port']}")
    except UndefinedValueError as e:
        print(f"Error: falta variable de entorno -> {e}")
        raise SystemExit(1)

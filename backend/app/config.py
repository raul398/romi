from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    kling_access_key: str = ""
    kling_secret_key: str = ""
    happyhorse_api_key: str = ""
    mongo_uri: str = "mongodb://mongo:27017/romi"
    rabbitmq_uri: str = "amqp://guest:guest@rabbitmq:5672//"
    redis_url: str = "redis://redis:6379/0"
    celery_broker_url: str = "amqp://guest:guest@rabbitmq:5672//"
    celery_result_backend: str = "redis://redis:6379/0"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from api.emails import emails_router
from config.logger import log_error
from exceptions.bad_request_exception import BadRequestException

app = FastAPI()


@app.exception_handler(BadRequestException)
async def bad_request_exception_handler(request: Request, exc: BadRequestException):
    log_error(f'Bad request - {exc}')

    return JSONResponse(
        status_code=400,
        content={'error': str(exc)},
    )


@app.exception_handler(Exception)
async def other_exception_handler(request: Request, exc: Exception):
    log_error(f'Unhandled exception - {exc}')
    return JSONResponse(
        status_code=500,
        content={'error': str(exc)},
    )


app.include_router(emails_router)

FROM python:3.11

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY src/whombat /app/whombat

CMD ["python", "-m", "whombat"]

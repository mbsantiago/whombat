# == Build User Guide
FROM python:3.11 as guide_builder

RUN mkdir /guide

WORKDIR /back/

COPY back/docs /back/docs
COPY back/guide_requirements.txt /back/guide_requirements.txt
COPY back/mkdocs-guide.yml /back/mkdocs-guide.yml

RUN pip install -r guide_requirements.txt

RUN mkdocs build -f mkdocs-guide.yml -d /guide

# == Build Front End
FROM node:latest as web_builder

RUN mkdir /statics

WORKDIR /front/

COPY front/ /front/

RUN npm install

RUN npm run build

# == Run the web server
FROM python:3.11

WORKDIR back/

# Install libsndfile1
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    build-essential \
    libffi-dev \
    libgdal-dev \
    python3-dev

# Set the working directory to /code
WORKDIR /code

# Copy the current directory contents into the container at /code

# Copy the guide
COPY --from=guide_builder /guide/ /code/src/whombat/user_guide/

# Copy the statics
COPY --from=web_builder /front/out/ /code/src/whombat/statics/

# Install the Python dependencies for whombat
COPY back/requirements.txt /code/requirements.txt
RUN pip install -r requirements.txt

# Install the Python dependencies for soundevent
RUN pip install \
    crowsetta==4.0.0.post2 \
    cython==3.0.10 \
    email-validator==2.1.1 \
    importlib-resources==5.13.0 \
    matplotlib==3.7.5 \
    pydantic==2.7.1 \
    rasterio==1.3.10 \
    scikit-learn==1.3.2 \
    scipy==1.10.1 \
    shapely==2.0.4 \
    soundfile==0.12.1 \
    xarray==2023.1.0

# Copy the whombat source code
COPY back/src /code/src
COPY back/app.py /code/app.py
COPY back/pyproject.toml /code/pyproject.toml
COPY back/alembic.ini /code/alembic.ini
COPY back/README.md /code/README.md
COPY back/LICENSE /code/LICENSE

# Copy the soundevent source code
COPY soundevent /code/soundevent
    
# Install Whombat
RUN pip install --no-deps .

# Install soundevent
RUN pip install -e ./soundevent/

# Create a directory for audio files
RUN mkdir /audio
RUN mkdir /data

VOLUME ["/data"]

# Set the environment variables for the audio directory and the database URL
ENV WHOMBAT_AUDIO_DIR /audio
ENV WHOMBAT_DB_URL "sqlite+aiosqlite:////data/whombat.db"
ENV WHOMBAT_DEV "false"
ENV WHOMBAT_HOST "0.0.0.0"
ENV WHOMBAT_PORT "5000"
ENV WHOMBAT_LOG_LEVEL "info"
ENV WHOMBAT_LOG_TO_STDOUT "true"
ENV WHOMBAT_LOG_TO_FILE "false"
ENV WHOMBAT_OPEN_ON_STARTUP "false"
ENV WHOMBAT_DOMAIN "localhost"

# Expose the port for the web server
EXPOSE 5000

# Run the command to start the web server
CMD ["python", "app.py"]

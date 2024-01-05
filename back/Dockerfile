FROM python:3.11

# Install libsndfile1
RUN apt-get update && apt-get install -y libsndfile1 build-essential libffi-dev cargo python3-dev

# Set the working directory to /code
WORKDIR /code

# Copy the current directory contents into the container at /code
COPY . /code

# Install the Python dependencies
RUN pip install .

# Create a directory for audio files
RUN mkdir /audio
RUN mkdir /data

VOLUME ["/data"]

# Set the environment variables for the audio directory and the database URL
ENV AUDIO_DIR /audio
ENV DB_URL "sqlite+aiosqlite:////data/whombat.db"

# Expose the port for the web server
EXPOSE 5000

# Run the command to start the web server
CMD ["python", "-m", "whombat"]

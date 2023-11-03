# Use an official Node.js runtime as the base image
FROM node:18

# Create a user
RUN useradd -ms /bin/bash argilla

# Set the working directory
WORKDIR /home/argilla/

COPY frontend/ ./frontend/
COPY scripts/ ./scripts/
COPY docs/ ./docs/

# Change the ownership of the /home/argilla directory to the new user
RUN chown -R argilla:argilla /home/argilla

# Switch to the new user
USER argilla

# Install the project dependencies and build frontend static assets
RUN chmod +x ./scripts/build_frontend.sh && /bin/bash ./scripts/build_frontend.sh

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD /bin/bash -c "ls -al *; cd frontend && npm run dev"
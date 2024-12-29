# app5-broccolii

## Development Setup


How to install the app :
Run the setup_project.bat file
run those 2 commands :
    cd src-front
    npm run dev

Then, Ctrl+click the link given to launch the website


### Front

Requirements:
- NodeJS (installs npm)

```bash
cd src-front
npm ci # like install, but install the exact same versions as the initial install, rather than the latest sub-version. It ensures everyone has the exact same environment.
npm run dev -- --open
```

#### Formatting
```bash
npm run lint
npm run format
```

### Back

Requirements:
- Python 3 (Python 3.11 is recommended as it was developed using this version.)

**for Unix/macOS commands visit https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/#creating-a-virtual-environment**

- Go to the back-end directory: `cd src-back`.
- Setup a virtual environment:
```
py -m venv env
```

- Activate the environment:
```
.\env\Scripts\activate
```

- Install dependencies:
```
py -m pip install -r requirements.txt
```

- Launch the server:
```
fastapi run ./app/main.py
```

- Deactivate the environment:
```
deactivate
```

#### Initializing the environment

- in `src_back`, create `JWT_SECRET` with `openssl rand -hex 32 > JWT_SECRET`. `openssl` is bundled with Git Bash, or you can install it manually.

- With the environment active, run `py ./app/sql_script.py` to initialize the database. (If you built a docker image, it should already be done by the docker file.) This script should never be imported into the app, as it erases any existing database!

#### Updating dependencies

after installation or updates, do:
```
py -m pip freeze > requirements.txt
```

#### Formatting
```bash
flake8 .
black .
```

## Creating a new version

- bump the version number in package.json (and where it is displayed)
- merge to main
- tag the commit (`git tag -a v1.0.0 -m "v1.0.0"`)
- optionally, create a branch `release-v1.0.0`. Do **NOT** call it with the same name as the tag, this will confuse many tools.
    - This is useful if patches need to be done on a version in prod without needing to merge all work in progress work.

## Docker

- build: `. docker_build.sh` (if it is intended for production, generate a new `JWT_SECRET`).
- run (example): `docker run -p 8000:8000 app5-broccolii`
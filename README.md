# app5-broccolii

## Development Setup

### Front

Requirements:
- NodeJS (installs npm)

```bash
cd src-front
npm ci # like install, but install the exact same versions as the initial install, rather than the latest sub-version. It ensures everyone has the exact same environment.
npm run dev -- --open
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

- Deactivate the environment:
```
deactivate
```

#### Updating dependencies

after installation or updates, do:
```
py -m pip freeze > requirements.txt
```

## Creating a new version

- bump the version number in package.json (and where it is displayed)
- merge to main
- tag the commit (`git tag -a v1.0.0 -m "v1.0.0"`)
- optionally, create a branch `release-v1.0.0`. Do **NOT** call it with the same name as the tag, this will confuse many tools.
    - This is useful if patches need to be done on a version in prod without needing to merge all work in progress work.
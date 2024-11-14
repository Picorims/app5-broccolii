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
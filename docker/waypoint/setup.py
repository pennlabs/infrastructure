from setuptools import setup, find_packages

setup(
    name="waypoint",
    version="0.0.1",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    install_requires=[],
    entry_points={
        "console_scripts": [
            "waypoint=main:main",
            "waypoint-client=waypoint_client:main",
        ],
    },
    author="Penn Labs",
    author_email="admin@pennlabs.org",
    description="Waypoint development environment manager",
    python_requires=">=3.6",
)


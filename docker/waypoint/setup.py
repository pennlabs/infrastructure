from setuptools import setup, find_packages

setup(
    name="waypoint",
    version="0.0.1",
    packages=find_packages(),
    install_requires=[],
    entry_points={
        'console_scripts': [
            'waypoint=src.main:main',
        ],
    },
    author="Penn Labs",
    author_email="admin@pennlabs.org",
    description="Waypoint development environment manager",
    python_requires=">=3.6",
) 
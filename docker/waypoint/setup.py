from setuptools import setup


setup(
    name="waypoint",
    version="1.0.3",
    package_dir={"": "src"},
    py_modules=["main", "waypoint_client"],
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

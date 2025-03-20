# 🚀 Waypoint: Unified Devbox Set-up  

An easy to setup dev environment for Penn Labs products that simplifies onboarding and cross-team collaboration.  

---

## 🎯 Motivation  
The current dev environment setup is:  
✅ **Time-consuming**  
✅ **Inconsistent across teams and devices**  
✅ **Hard to reproduce**  

**Waypoint** solves this by creating a standardized development environment that:  
- Works across all teams and roles  
- Speeds up onboarding for new developers  
- Makes it easier to switch between projects  

---

## ✨ Features  

| Feature | Description |
|---------|-------------|
| 🏗️ **Easy Setup** | Simple one-liner install to get started quickly |
| 🔄 **Consistent Environment** | Same set-up for all products, no more "works on my machine" issues |
| 🐳 **Docker-Based** | Run all services in a containerized environment |
| 🌐 **Cross-Platform** | Works on Mac, Linux, and Windows (with WSL) |
| 🔒 **Secret Management** | Secrets are mounted securely and persist after container updates |
| 🛠️ **Product Switching** | Instantly switch between product environments |

---

## 📥 Installation  

### **Prerequisites**  
- [Docker](https://www.docker.com/products/docker-desktop/) (or [OrbStack](https://orbstack.dev/) for Mac)  
- WSL (Windows only, Ubuntu 22.04+)  
- VSCode or Cursor  
- Python 3.11+  

### **Set-up**  
Install `waypoint-client` on your local machine:  
```
curl -sSL https://raw.githubusercontent.com/pennlabs/infrastructure/refs/heads/add-waypoint/docker/waypoint/install.sh | sudo bash
```

Configure Waypoint:  
```
waypoint-client configure
```

Start the container:  
```
waypoint-client start
```

✅ **Requires 6–7 GB of free space**  

---

## 🚀 Getting Started  

### 1. **Attach to the Container**  
- Install the **VSCode Dev Containers** extension.  
- Open **Command Palette** → `Dev Containers: Attach to Running Container`.
- To open the Command Palette in VSCode, press <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> (Mac) or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> (Windows).  

### 2. **Set Up a Product**  
```
waypoint services
waypoint init [product] # or just `waypoint init`
waypoint switch [product]
```

### List of all currently supported products.

Warning: Penn-Courses requires a special SQL file.
| Product              | SHA                                      |
|---------------------|------------------------------------------|
| **office-hours-queue** | 524282d029a330b59158e80299e3be23988f1765 |
| **penn-clubs**         | d2e5758f1498b17cd3f20d08c37969d3e8c9c7bd |
| **penn-mobile**        | b1a8bfa53a35496c972b880f7e3ab9d93845b614 |
| **penn-courses**       | 723640b1dbb815877c24bb1bc8b729c15e12c87a |
| **platform**           | 42c56ff509f60de5389262a9de5e38faf1d9aac2 |


### 3. **Start Developing**  
- Code and secrets are mounted to your local machine.  
- Any changes made inside `/labs` will persist after container updates.  

---

## 🧩 CLI Commands  

### **Local CLI** (`waypoint-client`)  
| Command | Description |
|---------|-------------|
| `waypoint-client configure` | Set up Waypoint on your local machine |
| `waypoint-client start` | Start the container and attach to VSCode |
| `waypoint-client start --rebuild` | Force a container rebuild |
| `waypoint-client spawn` | Open a new bash terminal inside the container |

### **Container CLI** (`waypoint`)  
| Command | Description |
|---------|-------------|
| `waypoint services (start/stop/status)` | Start, stop, or check status of services (e.g., PostgreSQL, Redis) |
| `waypoint init [product]` | Set up initial environment for a product |
| `waypoint switch [product]` | Switch environments |
| `waypoint sync [product]` | Refresh backend dependencies |
| `waypoint backend` | Start the backend |
| `waypoint frontend` | Start the frontend |

---

## 🔄 Dependency Management  

- Uses `uv` for fast installs and shared dependencies  
- Dependencies are **pinned** at build time for consistency  
- Backends are synced with Git SHA (e.g., OHQ → `524282d029a330b59158e80299e3be23988f1765`)  

### **Updating Dependencies**  
- Bump version by submitting a PR to Waypoint  
- `waypoint sync [product]` refreshes dependencies  

---

## 🔒 Secret Management  

- Secrets can be managed like normal with .env files in each project
- You can use the mounted secrets folder to assist with file transfers.

---

## 📦 Updating Waypoint  

### **Update Waypoint-Client**  
Re-run the install command:  
```
curl -sSL https://raw.githubusercontent.com/pennlabs/infrastructure/refs/heads/add-waypoint/docker/waypoint/install.sh | sudo bash
```

### **Update the Container**  
Rebuild the container:  
```
waypoint-client start --rebuild
```
- Old containers may need to be deleted  
- Mounted files will persist  

---

## 🌍 Mounted Paths: Configured with `waypoint-client configure`  

| Path | Configuration | Notes | 
|------|---------------|---------|
| `/root/.ssh` | **Mounted from `[CONFIG_DIR]/.ssh`** | SSH keys |
| `/root/.gnupg` | **Mounted from `[CONFIG_DIR]/.gnupg`** | GPG keys |
| `/labs` | **Mounted from `[CODE_DIR]`** | Stores repos |
| `/opt/waypoint/secrets` | **Mounted from `[SECRETS_DIR]`** | Stores secrets |


---

## 🤔 Common Questions  

### ✅ **Do local changes persist?**  
- Changes to mounted folders (code, secrets) will persist.  
- Other local changes (e.g., installing new packages) won’t persist after an update unless you push them.  

---

## 💡 Pro Tips  
✔️ Use `OrbStack` instead of Docker on Mac for better performance  
✔️ Waypoint files are stored at `/opt/waypoint` you can go to `/cli` and modify the `.waypoint-bashrc` if needed!
✔️ Use `waypoint switch [product]` to quickly switch environments  

---


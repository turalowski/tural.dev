---
title: "Docker CheatSheet"
excerpt: "Quick review topics about Docker"
order: 8
date: "2026-11-18"
hidden: true
tags:
  - "Docker"
  - "Version Control"
  - "Developer Tools"
  - "Web Development"
author: "Tural Hajiyev"
locale: "en"
category: "Engineering"
---

## Core concepts

```
Dockerfile (Instructions)
↓
Image (Build/read-only)
↓
Container (Running instance)
↓
Volume
```

Containers isolated, means they use separate namepsace, cgroups and networking.

```
docker run -p 8080:80 nginx
```

Docker -> Container(s)
Kubernaes -> Pod(s)
Node -> Machine
Cluster -> Group of Node(s)

Docker -> Compose -> Kubernetes




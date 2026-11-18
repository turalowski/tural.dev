---
title: "Git CheatSheet"
excerpt: "Quick review topics about Git"
order: 7
hidden: true
tags:
  - "Git"
  - "Version Control"
  - "Developer Tools"
  - "Web Development"
author: "Tural Hajiyev"
locale: "en"
category: "Engineering"
---

## Git stores snapshots, not file diffs

Example:

```
project/
├── app.js
├── index.html
└── style.css
```

First commit:


```
Commit A
 ├── app.js
 ├── index.html
 └── style.css
 ```


After modifying app.js:

```
Commit B
 ├── app.js (new version)
 ├── index.html (same)
 └── style.css (same)
 ```


Git cleverly reuses unchanged objects, so it doesn't duplicate everything on disk.

## Everything is identified by a hash

Git calculates a SHA hash for stored content.

Example:

```bash
echo "Hello" | git hash-object --stdin
```

Output:

```bash
e965047ad7c57865823c7d992b1d046ea66edf78
```


This hash becomes the object's ID.

If the content changes by even one character:

```bash
Hello

↓

Hello!
```

the hash becomes completely different. This is how Git detects changes.

## Git object types

### Blob

Represents file contents.

```bash
app.js

↓

Blob 
└── console.log("Hello")
```

### Tree

Represents directories.


```
src/
├── app.js
└── utils.js

↓

Tree
├── app.js → Blob
└── utils.js → Blob
```


Similar to a filesystem folder.

### Commit

Stores:

```
tree reference
author
timestamp
commit message
parent commit
```
> Merge commit can have 2 parents.

Example:

```
Commit
├── tree: xyz123
├── parent: abc456
├── author: Tural
└── message: Fix login bug
```

### Tag

```
v1.0 -> Commit A
```

### git add

1. Reads file contents
2. Creates a blob object
3. Calculates hash
4. Stores blob in `.git/objects`

The change is now in the staging area (index).

```bash
Working Directory
       ↓
     git add
       ↓
 Index (Staging Area)
 ```

 ### git commit

 1. Creates tree objects
 2. Creates a commit object
 3. Links commit to previous commit

 ### Branches


```bash
main              feature-login
 ↓                     ↓
Commit C            Commit E
                       |
                    Commit D 
                       | 
                    Commit C
```

Only the pointer moved.

### What is HEAD?

> Which branch/commit am I currently on?

### Merging

1. Git finds common ancestor
2. Git compares branches
3. Then creates:

```bash
Then creates:

         D --- E
        /       \
A --- B --- C --- M
```

where M is a merge commit.

### git push

1. Connects to remote
2. Checks which objects remote already has
3. Sends only missing objects
4. Updates remote branch pointer

### git pull

```bash
git fetch
git merge
```

### .git directory

The entire repository history lives here:

```bash
.git/
├── objects/
├── refs/
├── HEAD
├── index
└── config
```


Important files:

```bash
HEAD        -> current branch
objects/    -> blobs, trees, commits
refs/heads/ -> branch pointers
index       -> staging area
```

### Mental model

```
Files
  ↓
Blobs
  ↓
Trees (folders)
  ↓
Commit (snapshot)
  ↓
Branch (pointer)
  ↓
HEAD (current pointer)
```

### Rebase

While you're working on feature, another developer adds commit C to main.

If you merge, you get:

```
       D --- E
      /       \
A --- B --- C --- M
```



With rebase:

```bash
A --- B --- C --- D' --- E'
```

D' and E' are new commits.

1. Starts from C
2. Applies changes from D
3. Creates new commit D'
4. Applies changes from E
5. Creates new commit E'

> Take my changes and pretend I started from the latest main.


### Squash (combine commits)

```bash
A --- B --- C --- D --- E

C = add login form
D = fix typo
E = fix typo again
```

After Squash:

```bash
A --- B --- X
```

### Cherry-pick

Apply a specific commit from another branch. Cherry-pick creates a new commit.

```bash
~main | git cherry-pick E

main

A --- B --- C --- E'

feature

A --- B --- D --- E

```






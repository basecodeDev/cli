# This is our construct.
![Construct](https://i.pinimg.com/originals/d8/67/2f/d8672fea969d69c9a2f6b383fc35ca29.png)

## Install For Global
```bash
npm install -g @kubibasecode/basecodecli
```

## Create project
```bash
constructcli create --name project_name
```

* Other project helpfull commands

### Migration database
```bash
constructcli db:migrate
```
### Seed database
```bash
constructcli db:seed
```
### Reset database
```bash
constructcli db:reset
```
### Create module
```bash
constructcli create:module --directory directory_name --database database_name --modulename modulename
```
### Delete module
```bash
constructcli delete:module --directory directory_name
```
### Create tools
```bash
constructcli create:tools
```
# How to install
```bash
npm install -g @kubibasecode/basecodecli
```

## Create project
```bash
constructcli create project_name
```
## Migration database
```bash
constructcli db:migrate
```
## Seed database
```bash
constructcli db:seed
```

## Reset database
```bash
constructcli db:reset
```

> Other project helpfull commands
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
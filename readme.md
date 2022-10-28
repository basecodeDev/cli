# This is our construct.
![Construct](https://i.pinimg.com/originals/d8/67/2f/d8672fea969d69c9a2f6b383fc35ca29.png)

## Install For Global
```bash
npm install -g baseconstruct
```

## Create project
```bash
construct create --name project_name
```

* Other project helpfull commands

### Migration database
```bash
construct db:migrate
```
### Seed database
```bash
construct db:seed
```
### Reset database
```bash
construct db:reset
```
### Create module
```bash
construct create:module --directory directory_name --database database_name --modulename modulename
```
### Delete module
```bash
construct delete:module --directory directory_name
```
### Add package
```bash
construct add:package
```

### Install package
```bash
construct install:package
```

### Update package
```bash
construct update:package
```

### Create tools
```bash
construct create:tools
```
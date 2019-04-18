# DynamoDB Seed

This is a cli library that handling seed data for DynamoDB.

## Installation

install packages globally

```
$ npm i -g dynamodb-seed
```

and exexute below

```
$ dynamodb --help
```

or install package locally

```
$ npm i dynamodb-seed
```

and execute below

```
$ npx dynamodb-seed --help
```

## YAML format

```
Seeds:
  -
    TableName: "Products" # required
    Key:                  # required
      - id
    NotUpdateAttributes:  # optional: not update this attributes if an item exists
      - stock
    Items:                # required
      -
        id: 1
        name: "product name 1"
        stock: 0
      -
        id: 2
        name: "product name 2"
        stock: 0
  -
    TableName: "Shops"
    Key:
      - id
    Items:
      -
        id: 1
        name: "shop name"
```

## Usage

```
load a file
$ dynamodb-seed -f './seed.yaml'

load files
$ dynamodb-seed -f './**/*.yaml'

load files in some directory
$ dynamodb-seed -f './+(default|development)/*.yaml'
```

Learn more about the file options glob pattern [here](https://www.npmjs.com/package/glob).

## Options

```
$ dynamodb-seed --help
Usage: dynamodb-seed --debug

Options:
  -f, --file <value>    Required: seed files using glob pattern
  -p, --prefix <value>  a table prefix
  -s, --suffix <value>  a table suffix
  --region <value>      DynamoDB region (default: "ap-northeast-1")
  --endpoint <value>    DynamoDB endpoint
  --profile <value>     an AWS profile name
  --debug               output debug logs
  -h, --help            output usage information
```

## TODO

* Use batchWriteItem


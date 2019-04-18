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
    TableName: "TableA"  # required
    Keys:                # required
      - hashKey
      - rangeKey
    NotUpdateAttributes: # optional: not update this attributes if an item exists
    Items:               # required
      -
        id: "0001"
        value: "0001"
      -
        id: "0002"
        value: "0002"
  -
    TableName: "TableB"
    Items:
      -
        id: "0001"
        value: "0001"
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


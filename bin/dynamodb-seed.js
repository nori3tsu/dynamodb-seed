#!/usr/bin/env node
"use strict";

const fs = require("fs");
const yaml = require('js-yaml');
const glob = require('glob-promise');
const program = require("commander");
const AWS = require("aws-sdk");
const _ = require("lodash");
const retry = require("retry");

program
  .usage("-f file")
  .option("-f, --file <value>", "Required: seed files using glob pattern", String)
  .usage("-p, --prefix <value>")
  .option("-p, --prefix <value>", "a table prefix", String)
  .usage("-s, --suffix <value>")
  .option("-s, --suffix <value>", "a table suffix", String)
  .usage("--region")
  .option("--region <value>", "DynamoDB region", String, "ap-northeast-1")
  .usage("--endpoint")
  .option("--endpoint <value>", "DynamoDB endpoint", String)
  .usage("--profile")
  .option("--profile <value>", "an AWS profile name", String)
  .usage("--debug")
  .option("--debug", "output debug logs")
  .parse(process.argv);

const validate = ({ TableName, Key, NotUpdateAttributes, Items}) => {
  if (!TableName) {
    console.log("TableName is required.");
    process.exit(1);
  }

  if (_.isEmpty(Key)) {
    console.log(`${TableName}: Key is required.`);
    process.exit(1);
  }

  if (_.isEmpty(Items)) {
    console.log(`${TableName}: Items is required.`);
    process.exit(1);
  }
}

const withRetry = (fn) => {
  const operation = retry.operation({ retries: 10 });
  return operation.attempt(async (currentAttempt) => {
    try {
      await fn();
    } catch (err) {
      console.log(`retry: ${err.message}`);
      if (operation.retry(err)) {
        return;
      }
    }
  });
};

const run = async () => {
  if (!program.file) {
    program.outputHelp();
    process.exit(1);
  }

  const options = {};
  if (program.region) options.region = program.region;
  if (program.endpoint) options.endpoint = program.endpoint;

  if (program.profile) {
    const credentials = new AWS.SharedIniFileCredentials({profile: program.profile});
    AWS.config.credentials = credentials;
  }

  const client = new AWS.DynamoDB.DocumentClient(options);

  const files = await glob(program.file)
  files.forEach(async (file) => {
    try {
      if (!file.match(/\.(yml|yaml)$/)) {
        return;
      }

      console.log(file);

      const seeds = yaml.safeLoad(fs.readFileSync(file, "utf8"))['Seeds'];
      await seeds.map(async ({ TableName, Key, NotUpdateAttributes = [], Items }) => {
        validate({TableName, Key, NotUpdateAttributes, Items});

        const tableName = [
          program.prefix,
          TableName,
          program.suffix,
        ].filter(s => s != undefined).join('');

        console.log(`Load ${Items.length} items into the ${tableName}.`)

        return Promise.all(Items.map(async (Item) => {
          return withRetry(async () => {
            const data = await client.get({TableName: tableName, Key: _.pick(Item, Key)}).promise();
            const currentItem = data.Item;
            if (!currentItem) {
              const params = { TableName: tableName, Item };
              if (program.debug) {
                console.log("New item:")
                console.log(params);
              }

              return await client.put(params).promise();
            }

            const params = {
              TableName: tableName,
              Item: Object.assign({}, currentItem, _.omit(Item, NotUpdateAttributes)),
            };

            if (!_.isEmpty(NotUpdateAttributes)) {
              params.Expected = {};
              NotUpdateAttributes.forEach((attribute) => {
                params.Expected[attribute] = { Value: currentItem[attribute] }
              });
            }

            if (program.debug) {
              console.log("Existed item:")
              console.log(params);
            }

            return await client.put(params).promise();
          });
        })).catch((err) => {
          console.log(`Failed to load items - ${err.message}`);
          process.exit(1);
        });
      });
    } catch (err) {
      console.log(`Faild to parse ${file} - ${err.message}`)
      process.exit(1);
    }
  });
}

run();


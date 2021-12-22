[![Build Status](https://travis-ci.org/kaelzhang/node-hhv-llv.svg?branch=master)](https://travis-ci.org/kaelzhang/node-hhv-llv)
[![Coverage](https://codecov.io/gh/kaelzhang/node-hhv-llv/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/node-hhv-llv)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/node-hhv-llv?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/node-hhv-llv)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/hhv-llv.svg)](http://badge.fury.io/js/hhv-llv)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/hhv-llv.svg)](https://www.npmjs.org/package/hhv-llv)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/node-hhv-llv.svg)](https://david-dm.org/kaelzhang/node-hhv-llv)
-->

# hhv-llv

Calculates the highest high values / lowest low values of closing prices over the preceding periods (periods includes the current time)

## Install

```sh
$ npm install hhv-llv
```

## Usage

```js
import {
  hhv,
  llv
} from 'hhv-llv'

const array = [1, 2, 4, 1]

hhv(array, 2)    // [, 2, 4, 4]
hhv(array)       // 4
hhv(array, 5)    // [<4 empty items>]
hhv(array, 1)    // [1, 2, 4, 1]

hhv(array, 2)    // [, 1, 2, 2]
```

## hhv(data, periods)

- **data** `Array.<Number>` the array of closing prices.
- **periods** `Number` the size of periods

Returns `Number` the highest closing prices over the preceding `periods` periods.

## llv(data, periods)

Instead, returns `Number` the lowest closing prices.

## License

MIT

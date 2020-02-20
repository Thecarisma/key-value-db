
/*
 * The MIT License
 *
 * Copyright 2020 Adewale Azeez <azeezadewale98@gmail.com>.
 *
 */
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 
const konfigerUtil = require("./KonfigerUtil.js")
const KonfigerObject = require("./KonfigerObject.js")
const KonfigerStream = require("./KonfigerStream.js")
 
const MAX_CAPACITY = Number.MAX_SAFE_INTEGER - 1

function fromFile(filePath, delimeter, seperator) {
    return fromStream((new KonfigerStream(filePath, delimeter, seperator)))
}

function fromString(filePath, delimeter, seperator) {
    
}

function fromStream(konfigerStream) {
    const konfiger = new Konfiger(konfigerStream.delimeter, konfigerStream.seperator)
    konfiger.createdFromStream = true
    konfiger.stream = konfigerStream
    return konfiger
}

function Konfiger(delimeter, seperator) {
    this.stream = null
    this.createdFromStream = false
    this.konfigerObjects = new Map()
    this.delimeter = delimeter
    this.seperator = seperator
    this.errTolerance = false
    this.caseSensitive = true
    this.dbChanged = true
    
    this.enableCache_ = true
    this.prevCachedObject = { ckey : "", cvalue : null }
    this.currentCachedObject = { ckey : "", cvalue : null }
}

/*Konfiger.prototype[Symbol.iterator] = function() {
	var index = 0
	var data  = this.konfigerObjects

	return {
		next: function() {
			return { value: data[index++], done: index > data.length }
		}
	}
}

Konfiger.prototype.forEach = function() {
	var index = 0
	var data  = this.konfigerObjects

	return {
		next: function() {
			return { value: data[index++], done: index > data.length }
		}
	}
}*/

Konfiger.prototype.put = function(key, value) {
    if (konfigerUtil.isString(key)) {
        if (konfigerUtil.isString(value)) {
            this.putString(key, value)
            
        } else if (konfigerUtil.isBoolean(value)) {
            this.putBoolean(key, value)
            
        } else if (konfigerUtil.isNumber(value)) {
            this.putLong(key, value)
            
        } else {
            this.putString(key, JSON.stringify(value))
        }
        
        
    } else {
        konfigerUtil.throwError("io.github.thecarisma.Konfiger", "invalid argument, key must be a string")
    }
}

Konfiger.prototype.putString = function(key, value) {
    if (!konfigerUtil.isString(key)) {
        throw new Error("io.github.thecarisma.Konfiger: Invalid argument, key must be a string")
    }
    if (!konfigerUtil.isString(value)) {
        throw new Error("io.github.thecarisma.Konfiger: invalid argument, expecting String found " + konfigerUtil.typeOf(value))
    }
    this.konfigerObjects.set(key, value)
    this.dbChanged = true
    if (this.enableCache_) {
        this.shiftCache(key, value)
    }
}

Konfiger.prototype.putBoolean = function(key, value) {
    if (!konfigerUtil.isBoolean(value)) {
        throw new Error("io.github.thecarisma.Konfiger: invalid argument, expecting Boolean found " + konfigerUtil.typeOf(value))
    }
    this.putString(key, value.toString())
}

Konfiger.prototype.putLong = function(key, value) {
    if (!konfigerUtil.isNumber(value)) {
        throw new Error("io.github.thecarisma.Konfiger: invalid argument, expecting Number found " + konfigerUtil.typeOf(value))
    }
    this.putString(key, value.toString())
}

Konfiger.prototype.putInt = function(key, value) {
    this.putLong(key, value)
}

Konfiger.prototype.putFloat = function(key, value) {
    if (!konfigerUtil.isFloat(value)) {
        throw new Error("io.github.thecarisma.Konfiger: invalid argument, expecting Float found " + konfigerUtil.typeOf(value))
    }
    this.putString(key, value.toString())
}

Konfiger.prototype.get = function(key, defaultValue) {
    if (!konfigerUtil.isString(key)) {
        throw new Error("io.github.thecarisma.Konfiger: Invalid argument, key must be a string")
    }
    if (this.enableCache_) {
        if (this.currentCachedObject.ckey === key) {
            return this.currentCachedObject.cvalue
        }
        if (this.prevCachedObject.ckey === key) {
            return this.prevCachedObject.cvalue
        }
        //TODO: maybe make the map value currentCache if no
        //performance cost
    }
    if (defaultValue && !this.contains(key)) {
        return defaultValue
    }
    return this.konfigerObjects.get(key)
}

Konfiger.prototype.getString = function(key, defaultValue) {
    var value = this.get(key, defaultValue)
    return this.konfigerObjects.get(key).toString()
}

Konfiger.prototype.getBoolean = function(key, defaultValue) {
    var value = this.get(key, defaultValue)
    return (value ? Boolean(value) : value)
}

Konfiger.prototype.getLong = function(key, defaultValue) {
    var value = this.get(key, defaultValue)
    return (value ? Number(value) : value)
}

Konfiger.prototype.getInt = function(key, defaultValue) {
    return this.getLong(key, defaultValue)
}

Konfiger.prototype.getFloat = function(key, defaultValue) {
    var value = this.get(key, defaultValue)
    return (value ? parseFloat(value) : value)
}

Konfiger.prototype.shiftCache = function(key, value) {
	this.prevCachedObject =  this.currentCachedObject
    this.currentCachedObject = { ckey : key, cvalue : value }
}

Konfiger.prototype.enableCache = function(enableCache_) {
	if (!konfigerUtil.isBoolean(enableCache_)) {
        konfigerUtil.throwError("io.github.thecarisma.Konfiger", "invalid argument, expecting boolean found " 
                                + konfigerUtil.typeOf(enableCache_))
    }
    this.prevCachedObject = { ckey : "", cvalue : null }
    this.currentCachedObject = { ckey : "", cvalue : null }
    this.enableCache_ = enableCache_
}

Konfiger.prototype.contains = function(key) {
    return this.konfigerObjects.has(key)
}

Konfiger.prototype.keys = function(key) {
    return this.konfigerObjects.keys()
}

Konfiger.prototype.values = function(key) {
    return this.konfigerObjects.values()
}

Konfiger.prototype.entries = function() {
    return this.konfigerObjects.entries()
}

Konfiger.prototype.clear = function() {
    this.prevCachedObject = { ckey : "", cvalue : null }
    this.currentCachedObject = { ckey : "", cvalue : null }
    this.konfigerObjects.clear()
}

Konfiger.prototype.remove = function(keyIndex) {
    if (konfigerUtil.isString(keyIndex)) {
        return this.konfigerObjects.delete(keyIndex)
    } else if (konfigerUtil.isNumber(keyIndex)) {
        if (keyIndex < this.konfigerObjects.size) {
            var i = -1
            for (let o of this.keys()) {
                ++i
                if (i === keyIndex) {
                    return this.remove(o)
                }
            }
            
        }
        var i = keyIndex
        
    } else {
        throw new Error("io.github.thecarisma.Konfiger: Invalid argument, expecting the entry key(string) or index(Number) found " + 
                        konfigerUtil.typeOf(keyIndex))
    }
}

Konfiger.prototype.size = function() {
    return this.konfigerObjects.size
}

Konfiger.prototype.isEmpty = function() {
    return this.konfigerObjects.size === 0
}

Konfiger.prototype.getSeperator = function() {
    return this.seperator
}

Konfiger.prototype.setSeperator = function(seperator) {
    if (!konfigerUtil.isChar(seperator)) {
        throw new Error("io.github.thecarisma.Konfiger: Invalid argument, expecting a character found " + 
                        konfigerUtil.typeOf(seperator))
    }
    this.seperator = seperator
}

Konfiger.prototype.getDelimeter = function() {
    return this.delimeter
}

Konfiger.prototype.setDelimeter = function(delimeter) {
    if (!konfigerUtil.isChar(delimeter)) {
        throw new Error("io.github.thecarisma.Konfiger: Invalid argument, expecting a character found " + 
                        konfigerUtil.typeOf(delimeter))
    }
    this.delimeter = delimeter
}



module.exports = { 
    MAX_CAPACITY,
    fromFile
}
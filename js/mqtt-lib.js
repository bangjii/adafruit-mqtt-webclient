! function(e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
    else if ("function" == typeof define && define.amd) define([], e);
    else {
        var f;
        "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.mqtt = e()
    }
}(function() {
    var define, module, exports;
    return function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {
                    exports: {}
                };
                t[o][0].call(l.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    }({
        1: [function(require, module, exports) {}, {}],
        2: [function(require, module, exports) {
            arguments[4][1][0].apply(exports, arguments)
        }, {
            dup: 1
        }],
        3: [function(require, module, exports) {
            var base64 = require("base64-js");
            var ieee754 = require("ieee754");
            var isArray = require("is-array");
            exports.Buffer = Buffer;
            exports.SlowBuffer = SlowBuffer;
            exports.INSPECT_MAX_BYTES = 50;
            Buffer.poolSize = 8192;
            var kMaxLength = 1073741823;
            var rootParent = {};
            Buffer.TYPED_ARRAY_SUPPORT = function() {
                try {
                    var buf = new ArrayBuffer(0);
                    var arr = new Uint8Array(buf);
                    arr.foo = function() {
                        return 42
                    };
                    return arr.foo() === 42 && typeof arr.subarray === "function" && new Uint8Array(1).subarray(1, 1).byteLength === 0
                } catch (e) {
                    return false
                }
            }();

            function Buffer(arg) {
                if (!(this instanceof Buffer)) {
                    if (arguments.length > 1) return new Buffer(arg, arguments[1]);
                    return new Buffer(arg)
                }
                this.length = 0;
                this.parent = undefined;
                if (typeof arg === "number") {
                    return fromNumber(this, arg)
                }
                if (typeof arg === "string") {
                    return fromString(this, arg, arguments.length > 1 ? arguments[1] : "utf8")
                }
                return fromObject(this, arg)
            }

            function fromNumber(that, length) {
                that = allocate(that, length < 0 ? 0 : checked(length) | 0);
                if (!Buffer.TYPED_ARRAY_SUPPORT) {
                    for (var i = 0; i < length; i++) {
                        that[i] = 0
                    }
                }
                return that
            }

            function fromString(that, string, encoding) {
                if (typeof encoding !== "string" || encoding === "") encoding = "utf8";
                var length = byteLength(string, encoding) | 0;
                that = allocate(that, length);
                that.write(string, encoding);
                return that
            }

            function fromObject(that, object) {
                if (Buffer.isBuffer(object)) return fromBuffer(that, object);
                if (isArray(object)) return fromArray(that, object);
                if (object == null) {
                    throw new TypeError("must start with number, buffer, array or string")
                }
                if (typeof ArrayBuffer !== "undefined" && object.buffer instanceof ArrayBuffer) {
                    return fromTypedArray(that, object)
                }
                if (object.length) return fromArrayLike(that, object);
                return fromJsonObject(that, object)
            }

            function fromBuffer(that, buffer) {
                var length = checked(buffer.length) | 0;
                that = allocate(that, length);
                buffer.copy(that, 0, 0, length);
                return that
            }

            function fromArray(that, array) {
                var length = checked(array.length) | 0;
                that = allocate(that, length);
                for (var i = 0; i < length; i += 1) {
                    that[i] = array[i] & 255
                }
                return that
            }

            function fromTypedArray(that, array) {
                var length = checked(array.length) | 0;
                that = allocate(that, length);
                for (var i = 0; i < length; i += 1) {
                    that[i] = array[i] & 255
                }
                return that
            }

            function fromArrayLike(that, array) {
                var length = checked(array.length) | 0;
                that = allocate(that, length);
                for (var i = 0; i < length; i += 1) {
                    that[i] = array[i] & 255
                }
                return that
            }

            function fromJsonObject(that, object) {
                var array;
                var length = 0;
                if (object.type === "Buffer" && isArray(object.data)) {
                    array = object.data;
                    length = checked(array.length) | 0
                }
                that = allocate(that, length);
                for (var i = 0; i < length; i += 1) {
                    that[i] = array[i] & 255
                }
                return that
            }

            function allocate(that, length) {
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    that = Buffer._augment(new Uint8Array(length))
                } else {
                    that.length = length;
                    that._isBuffer = true
                }
                var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1;
                if (fromPool) that.parent = rootParent;
                return that
            }

            function checked(length) {
                if (length >= kMaxLength) {
                    throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + kMaxLength.toString(16) + " bytes")
                }
                return length | 0
            }

            function SlowBuffer(subject, encoding) {
                if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding);
                var buf = new Buffer(subject, encoding);
                delete buf.parent;
                return buf
            }
            Buffer.isBuffer = function isBuffer(b) {
                return !!(b != null && b._isBuffer)
            };
            Buffer.compare = function compare(a, b) {
                if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                    throw new TypeError("Arguments must be Buffers")
                }
                if (a === b) return 0;
                var x = a.length;
                var y = b.length;
                var i = 0;
                var len = Math.min(x, y);
                while (i < len) {
                    if (a[i] !== b[i]) break;
                    ++i
                }
                if (i !== len) {
                    x = a[i];
                    y = b[i]
                }
                if (x < y) return -1;
                if (y < x) return 1;
                return 0
            };
            Buffer.isEncoding = function isEncoding(encoding) {
                switch (String(encoding).toLowerCase()) {
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "binary":
                    case "base64":
                    case "raw":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return true;
                    default:
                        return false
                }
            };
            Buffer.concat = function concat(list, length) {
                if (!isArray(list)) throw new TypeError("list argument must be an Array of Buffers.");
                if (list.length === 0) {
                    return new Buffer(0)
                } else if (list.length === 1) {
                    return list[0]
                }
                var i;
                if (length === undefined) {
                    length = 0;
                    for (i = 0; i < list.length; i++) {
                        length += list[i].length
                    }
                }
                var buf = new Buffer(length);
                var pos = 0;
                for (i = 0; i < list.length; i++) {
                    var item = list[i];
                    item.copy(buf, pos);
                    pos += item.length
                }
                return buf
            };

            function byteLength(string, encoding) {
                if (typeof string !== "string") string = String(string);
                if (string.length === 0) return 0;
                switch (encoding || "utf8") {
                    case "ascii":
                    case "binary":
                    case "raw":
                        return string.length;
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return string.length * 2;
                    case "hex":
                        return string.length >>> 1;
                    case "utf8":
                    case "utf-8":
                        return utf8ToBytes(string).length;
                    case "base64":
                        return base64ToBytes(string).length;
                    default:
                        return string.length
                }
            }
            Buffer.byteLength = byteLength;
            Buffer.prototype.length = undefined;
            Buffer.prototype.parent = undefined;
            Buffer.prototype.toString = function toString(encoding, start, end) {
                var loweredCase = false;
                start = start | 0;
                end = end === undefined || end === Infinity ? this.length : end | 0;
                if (!encoding) encoding = "utf8";
                if (start < 0) start = 0;
                if (end > this.length) end = this.length;
                if (end <= start) return "";
                while (true) {
                    switch (encoding) {
                        case "hex":
                            return hexSlice(this, start, end);
                        case "utf8":
                        case "utf-8":
                            return utf8Slice(this, start, end);
                        case "ascii":
                            return asciiSlice(this, start, end);
                        case "binary":
                            return binarySlice(this, start, end);
                        case "base64":
                            return base64Slice(this, start, end);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return utf16leSlice(this, start, end);
                        default:
                            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                            encoding = (encoding + "").toLowerCase();
                            loweredCase = true
                    }
                }
            };
            Buffer.prototype.equals = function equals(b) {
                if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                if (this === b) return true;
                return Buffer.compare(this, b) === 0
            };
            Buffer.prototype.inspect = function inspect() {
                var str = "";
                var max = exports.INSPECT_MAX_BYTES;
                if (this.length > 0) {
                    str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
                    if (this.length > max) str += " ... "
                }
                return "<Buffer " + str + ">"
            };
            Buffer.prototype.compare = function compare(b) {
                if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
                if (this === b) return 0;
                return Buffer.compare(this, b)
            };
            Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
                if (byteOffset > 2147483647) byteOffset = 2147483647;
                else if (byteOffset < -2147483648) byteOffset = -2147483648;
                byteOffset >>= 0;
                if (this.length === 0) return -1;
                if (byteOffset >= this.length) return -1;
                if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0);
                if (typeof val === "string") {
                    if (val.length === 0) return -1;
                    return String.prototype.indexOf.call(this, val, byteOffset)
                }
                if (Buffer.isBuffer(val)) {
                    return arrayIndexOf(this, val, byteOffset)
                }
                if (typeof val === "number") {
                    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === "function") {
                        return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
                    }
                    return arrayIndexOf(this, [val], byteOffset)
                }

                function arrayIndexOf(arr, val, byteOffset) {
                    var foundIndex = -1;
                    for (var i = 0; byteOffset + i < arr.length; i++) {
                        if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
                            if (foundIndex === -1) foundIndex = i;
                            if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
                        } else {
                            foundIndex = -1
                        }
                    }
                    return -1
                }
                throw new TypeError("val must be string, number or Buffer")
            };
            Buffer.prototype.get = function get(offset) {
                console.log(".get() is deprecated. Access using array indexes instead.");
                return this.readUInt8(offset)
            };
            Buffer.prototype.set = function set(v, offset) {
                console.log(".set() is deprecated. Access using array indexes instead.");
                return this.writeUInt8(v, offset)
            };

            function hexWrite(buf, string, offset, length) {
                offset = Number(offset) || 0;
                var remaining = buf.length - offset;
                if (!length) {
                    length = remaining
                } else {
                    length = Number(length);
                    if (length > remaining) {
                        length = remaining
                    }
                }
                var strLen = string.length;
                if (strLen % 2 !== 0) throw new Error("Invalid hex string");
                if (length > strLen / 2) {
                    length = strLen / 2
                }
                for (var i = 0; i < length; i++) {
                    var parsed = parseInt(string.substr(i * 2, 2), 16);
                    if (isNaN(parsed)) throw new Error("Invalid hex string");
                    buf[offset + i] = parsed
                }
                return i
            }

            function utf8Write(buf, string, offset, length) {
                return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
            }

            function asciiWrite(buf, string, offset, length) {
                return blitBuffer(asciiToBytes(string), buf, offset, length)
            }

            function binaryWrite(buf, string, offset, length) {
                return asciiWrite(buf, string, offset, length)
            }

            function base64Write(buf, string, offset, length) {
                return blitBuffer(base64ToBytes(string), buf, offset, length)
            }

            function ucs2Write(buf, string, offset, length) {
                return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
            }
            Buffer.prototype.write = function write(string, offset, length, encoding) {
                if (offset === undefined) {
                    encoding = "utf8";
                    length = this.length;
                    offset = 0
                } else if (length === undefined && typeof offset === "string") {
                    encoding = offset;
                    length = this.length;
                    offset = 0
                } else if (isFinite(offset)) {
                    offset = offset | 0;
                    if (isFinite(length)) {
                        length = length | 0;
                        if (encoding === undefined) encoding = "utf8"
                    } else {
                        encoding = length;
                        length = undefined
                    }
                } else {
                    var swap = encoding;
                    encoding = offset;
                    offset = length | 0;
                    length = swap
                }
                var remaining = this.length - offset;
                if (length === undefined || length > remaining) length = remaining;
                if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
                    throw new RangeError("attempt to write outside buffer bounds")
                }
                if (!encoding) encoding = "utf8";
                var loweredCase = false;
                for (;;) {
                    switch (encoding) {
                        case "hex":
                            return hexWrite(this, string, offset, length);
                        case "utf8":
                        case "utf-8":
                            return utf8Write(this, string, offset, length);
                        case "ascii":
                            return asciiWrite(this, string, offset, length);
                        case "binary":
                            return binaryWrite(this, string, offset, length);
                        case "base64":
                            return base64Write(this, string, offset, length);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return ucs2Write(this, string, offset, length);
                        default:
                            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                            encoding = ("" + encoding).toLowerCase();
                            loweredCase = true
                    }
                }
            };
            Buffer.prototype.toJSON = function toJSON() {
                return {
                    type: "Buffer",
                    data: Array.prototype.slice.call(this._arr || this, 0)
                }
            };

            function base64Slice(buf, start, end) {
                if (start === 0 && end === buf.length) {
                    return base64.fromByteArray(buf)
                } else {
                    return base64.fromByteArray(buf.slice(start, end))
                }
            }

            function utf8Slice(buf, start, end) {
                var res = "";
                var tmp = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; i++) {
                    if (buf[i] <= 127) {
                        res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
                        tmp = ""
                    } else {
                        tmp += "%" + buf[i].toString(16)
                    }
                }
                return res + decodeUtf8Char(tmp)
            }

            function asciiSlice(buf, start, end) {
                var ret = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; i++) {
                    ret += String.fromCharCode(buf[i] & 127)
                }
                return ret
            }

            function binarySlice(buf, start, end) {
                var ret = "";
                end = Math.min(buf.length, end);
                for (var i = start; i < end; i++) {
                    ret += String.fromCharCode(buf[i])
                }
                return ret
            }

            function hexSlice(buf, start, end) {
                var len = buf.length;
                if (!start || start < 0) start = 0;
                if (!end || end < 0 || end > len) end = len;
                var out = "";
                for (var i = start; i < end; i++) {
                    out += toHex(buf[i])
                }
                return out
            }

            function utf16leSlice(buf, start, end) {
                var bytes = buf.slice(start, end);
                var res = "";
                for (var i = 0; i < bytes.length; i += 2) {
                    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
                }
                return res
            }
            Buffer.prototype.slice = function slice(start, end) {
                var len = this.length;
                start = ~~start;
                end = end === undefined ? len : ~~end;
                if (start < 0) {
                    start += len;
                    if (start < 0) start = 0
                } else if (start > len) {
                    start = len
                }
                if (end < 0) {
                    end += len;
                    if (end < 0) end = 0
                } else if (end > len) {
                    end = len
                }
                if (end < start) end = start;
                var newBuf;
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    newBuf = Buffer._augment(this.subarray(start, end))
                } else {
                    var sliceLen = end - start;
                    newBuf = new Buffer(sliceLen, undefined);
                    for (var i = 0; i < sliceLen; i++) {
                        newBuf[i] = this[i + start]
                    }
                }
                if (newBuf.length) newBuf.parent = this.parent || this;
                return newBuf
            };

            function checkOffset(offset, ext, length) {
                if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
                if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length")
            }
            Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var val = this[offset];
                var mul = 1;
                var i = 0;
                while (++i < byteLength && (mul *= 256)) {
                    val += this[offset + i] * mul
                }
                return val
            };
            Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) {
                    checkOffset(offset, byteLength, this.length)
                }
                var val = this[offset + --byteLength];
                var mul = 1;
                while (byteLength > 0 && (mul *= 256)) {
                    val += this[offset + --byteLength] * mul
                }
                return val
            };
            Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 1, this.length);
                return this[offset]
            };
            Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                return this[offset] | this[offset + 1] << 8
            };
            Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                return this[offset] << 8 | this[offset + 1]
            };
            Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216
            };
            Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3])
            };
            Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var val = this[offset];
                var mul = 1;
                var i = 0;
                while (++i < byteLength && (mul *= 256)) {
                    val += this[offset + i] * mul
                }
                mul *= 128;
                if (val >= mul) val -= Math.pow(2, 8 * byteLength);
                return val
            };
            Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) checkOffset(offset, byteLength, this.length);
                var i = byteLength;
                var mul = 1;
                var val = this[offset + --i];
                while (i > 0 && (mul *= 256)) {
                    val += this[offset + --i] * mul
                }
                mul *= 128;
                if (val >= mul) val -= Math.pow(2, 8 * byteLength);
                return val
            };
            Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 1, this.length);
                if (!(this[offset] & 128)) return this[offset];
                return (255 - this[offset] + 1) * -1
            };
            Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                var val = this[offset] | this[offset + 1] << 8;
                return val & 32768 ? val | 4294901760 : val
            };
            Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 2, this.length);
                var val = this[offset + 1] | this[offset] << 8;
                return val & 32768 ? val | 4294901760 : val
            };
            Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24
            };
            Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]
            };
            Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return ieee754.read(this, offset, true, 23, 4)
            };
            Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 4, this.length);
                return ieee754.read(this, offset, false, 23, 4)
            };
            Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 8, this.length);
                return ieee754.read(this, offset, true, 52, 8)
            };
            Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
                if (!noAssert) checkOffset(offset, 8, this.length);
                return ieee754.read(this, offset, false, 52, 8)
            };

            function checkInt(buf, value, offset, ext, max, min) {
                if (!Buffer.isBuffer(buf)) throw new TypeError("buffer must be a Buffer instance");
                if (value > max || value < min) throw new RangeError("value is out of bounds");
                if (offset + ext > buf.length) throw new RangeError("index out of range")
            }
            Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
                var mul = 1;
                var i = 0;
                this[offset] = value & 255;
                while (++i < byteLength && (mul *= 256)) {
                    this[offset + i] = value / mul & 255
                }
                return offset + byteLength
            };
            Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset | 0;
                byteLength = byteLength | 0;
                if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
                var i = byteLength - 1;
                var mul = 1;
                this[offset + i] = value & 255;
                while (--i >= 0 && (mul *= 256)) {
                    this[offset + i] = value / mul & 255
                }
                return offset + byteLength
            };
            Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
                if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
                this[offset] = value;
                return offset + 1
            };

            function objectWriteUInt16(buf, value, offset, littleEndian) {
                if (value < 0) value = 65535 + value + 1;
                for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
                    buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8
                }
            }
            Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value;
                    this[offset + 1] = value >>> 8
                } else {
                    objectWriteUInt16(this, value, offset, true)
                }
                return offset + 2
            };
            Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 8;
                    this[offset + 1] = value
                } else {
                    objectWriteUInt16(this, value, offset, false)
                }
                return offset + 2
            };

            function objectWriteUInt32(buf, value, offset, littleEndian) {
                if (value < 0) value = 4294967295 + value + 1;
                for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
                    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255
                }
            }
            Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset + 3] = value >>> 24;
                    this[offset + 2] = value >>> 16;
                    this[offset + 1] = value >>> 8;
                    this[offset] = value
                } else {
                    objectWriteUInt32(this, value, offset, true)
                }
                return offset + 4
            };
            Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 24;
                    this[offset + 1] = value >>> 16;
                    this[offset + 2] = value >>> 8;
                    this[offset + 3] = value
                } else {
                    objectWriteUInt32(this, value, offset, false)
                }
                return offset + 4
            };
            Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) {
                    var limit = Math.pow(2, 8 * byteLength - 1);
                    checkInt(this, value, offset, byteLength, limit - 1, -limit)
                }
                var i = 0;
                var mul = 1;
                var sub = value < 0 ? 1 : 0;
                this[offset] = value & 255;
                while (++i < byteLength && (mul *= 256)) {
                    this[offset + i] = (value / mul >> 0) - sub & 255
                }
                return offset + byteLength
            };
            Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) {
                    var limit = Math.pow(2, 8 * byteLength - 1);
                    checkInt(this, value, offset, byteLength, limit - 1, -limit)
                }
                var i = byteLength - 1;
                var mul = 1;
                var sub = value < 0 ? 1 : 0;
                this[offset + i] = value & 255;
                while (--i >= 0 && (mul *= 256)) {
                    this[offset + i] = (value / mul >> 0) - sub & 255
                }
                return offset + byteLength
            };
            Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
                if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
                if (value < 0) value = 255 + value + 1;
                this[offset] = value;
                return offset + 1
            };
            Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value;
                    this[offset + 1] = value >>> 8
                } else {
                    objectWriteUInt16(this, value, offset, true)
                }
                return offset + 2
            };
            Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 8;
                    this[offset + 1] = value
                } else {
                    objectWriteUInt16(this, value, offset, false)
                }
                return offset + 2
            };
            Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value;
                    this[offset + 1] = value >>> 8;
                    this[offset + 2] = value >>> 16;
                    this[offset + 3] = value >>> 24
                } else {
                    objectWriteUInt32(this, value, offset, true)
                }
                return offset + 4
            };
            Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
                value = +value;
                offset = offset | 0;
                if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
                if (value < 0) value = 4294967295 + value + 1;
                if (Buffer.TYPED_ARRAY_SUPPORT) {
                    this[offset] = value >>> 24;
                    this[offset + 1] = value >>> 16;
                    this[offset + 2] = value >>> 8;
                    this[offset + 3] = value
                } else {
                    objectWriteUInt32(this, value, offset, false)
                }
                return offset + 4
            };

            function checkIEEE754(buf, value, offset, ext, max, min) {
                if (value > max || value < min) throw new RangeError("value is out of bounds");
                if (offset + ext > buf.length) throw new RangeError("index out of range");
                if (offset < 0) throw new RangeError("index out of range")
            }

            function writeFloat(buf, value, offset, littleEndian, noAssert) {
                if (!noAssert) {
                    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38)
                }
                ieee754.write(buf, value, offset, littleEndian, 23, 4);
                return offset + 4
            }
            Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
                return writeFloat(this, value, offset, true, noAssert)
            };
            Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
                return writeFloat(this, value, offset, false, noAssert)
            };

            function writeDouble(buf, value, offset, littleEndian, noAssert) {
                if (!noAssert) {
                    checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308)
                }
                ieee754.write(buf, value, offset, littleEndian, 52, 8);
                return offset + 8
            }
            Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
                return writeDouble(this, value, offset, true, noAssert)
            };
            Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
                return writeDouble(this, value, offset, false, noAssert)
            };
            Buffer.prototype.copy = function copy(target, targetStart, start, end) {
                if (!start) start = 0;
                if (!end && end !== 0) end = this.length;
                if (targetStart >= target.length) targetStart = target.length;
                if (!targetStart) targetStart = 0;
                if (end > 0 && end < start) end = start;
                if (end === start) return 0;
                if (target.length === 0 || this.length === 0) return 0;
                if (targetStart < 0) {
                    throw new RangeError("targetStart out of bounds")
                }
                if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
                if (end < 0) throw new RangeError("sourceEnd out of bounds");
                if (end > this.length) end = this.length;
                if (target.length - targetStart < end - start) {
                    end = target.length - targetStart + start
                }
                var len = end - start;
                if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) {
                    for (var i = 0; i < len; i++) {
                        target[i + targetStart] = this[i + start]
                    }
                } else {
                    target._set(this.subarray(start, start + len), targetStart)
                }
                return len
            };
            Buffer.prototype.fill = function fill(value, start, end) {
                if (!value) value = 0;
                if (!start) start = 0;
                if (!end) end = this.length;
                if (end < start) throw new RangeError("end < start");
                if (end === start) return;
                if (this.length === 0) return;
                if (start < 0 || start >= this.length) throw new RangeError("start out of bounds");
                if (end < 0 || end > this.length) throw new RangeError("end out of bounds");
                var i;
                if (typeof value === "number") {
                    for (i = start; i < end; i++) {
                        this[i] = value
                    }
                } else {
                    var bytes = utf8ToBytes(value.toString());
                    var len = bytes.length;
                    for (i = start; i < end; i++) {
                        this[i] = bytes[i % len]
                    }
                }
                return this
            };
            Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
                if (typeof Uint8Array !== "undefined") {
                    if (Buffer.TYPED_ARRAY_SUPPORT) {
                        return new Buffer(this).buffer
                    } else {
                        var buf = new Uint8Array(this.length);
                        for (var i = 0, len = buf.length; i < len; i += 1) {
                            buf[i] = this[i]
                        }
                        return buf.buffer
                    }
                } else {
                    throw new TypeError("Buffer.toArrayBuffer not supported in this browser")
                }
            };
            var BP = Buffer.prototype;
            Buffer._augment = function _augment(arr) {
                arr.constructor = Buffer;
                arr._isBuffer = true;
                arr._set = arr.set;
                arr.get = BP.get;
                arr.set = BP.set;
                arr.write = BP.write;
                arr.toString = BP.toString;
                arr.toLocaleString = BP.toString;
                arr.toJSON = BP.toJSON;
                arr.equals = BP.equals;
                arr.compare = BP.compare;
                arr.indexOf = BP.indexOf;
                arr.copy = BP.copy;
                arr.slice = BP.slice;
                arr.readUIntLE = BP.readUIntLE;
                arr.readUIntBE = BP.readUIntBE;
                arr.readUInt8 = BP.readUInt8;
                arr.readUInt16LE = BP.readUInt16LE;
                arr.readUInt16BE = BP.readUInt16BE;
                arr.readUInt32LE = BP.readUInt32LE;
                arr.readUInt32BE = BP.readUInt32BE;
                arr.readIntLE = BP.readIntLE;
                arr.readIntBE = BP.readIntBE;
                arr.readInt8 = BP.readInt8;
                arr.readInt16LE = BP.readInt16LE;
                arr.readInt16BE = BP.readInt16BE;
                arr.readInt32LE = BP.readInt32LE;
                arr.readInt32BE = BP.readInt32BE;
                arr.readFloatLE = BP.readFloatLE;
                arr.readFloatBE = BP.readFloatBE;
                arr.readDoubleLE = BP.readDoubleLE;
                arr.readDoubleBE = BP.readDoubleBE;
                arr.writeUInt8 = BP.writeUInt8;
                arr.writeUIntLE = BP.writeUIntLE;
                arr.writeUIntBE = BP.writeUIntBE;
                arr.writeUInt16LE = BP.writeUInt16LE;
                arr.writeUInt16BE = BP.writeUInt16BE;
                arr.writeUInt32LE = BP.writeUInt32LE;
                arr.writeUInt32BE = BP.writeUInt32BE;
                arr.writeIntLE = BP.writeIntLE;
                arr.writeIntBE = BP.writeIntBE;
                arr.writeInt8 = BP.writeInt8;
                arr.writeInt16LE = BP.writeInt16LE;
                arr.writeInt16BE = BP.writeInt16BE;
                arr.writeInt32LE = BP.writeInt32LE;
                arr.writeInt32BE = BP.writeInt32BE;
                arr.writeFloatLE = BP.writeFloatLE;
                arr.writeFloatBE = BP.writeFloatBE;
                arr.writeDoubleLE = BP.writeDoubleLE;
                arr.writeDoubleBE = BP.writeDoubleBE;
                arr.fill = BP.fill;
                arr.inspect = BP.inspect;
                arr.toArrayBuffer = BP.toArrayBuffer;
                return arr
            };
            var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g;

            function base64clean(str) {
                str = stringtrim(str).replace(INVALID_BASE64_RE, "");
                if (str.length < 2) return "";
                while (str.length % 4 !== 0) {
                    str = str + "="
                }
                return str
            }

            function stringtrim(str) {
                if (str.trim) return str.trim();
                return str.replace(/^\s+|\s+$/g, "")
            }

            function toHex(n) {
                if (n < 16) return "0" + n.toString(16);
                return n.toString(16)
            }

            function utf8ToBytes(string, units) {
                units = units || Infinity;
                var codePoint;
                var length = string.length;
                var leadSurrogate = null;
                var bytes = [];
                var i = 0;
                for (; i < length; i++) {
                    codePoint = string.charCodeAt(i);
                    if (codePoint > 55295 && codePoint < 57344) {
                        if (leadSurrogate) {
                            if (codePoint < 56320) {
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                leadSurrogate = codePoint;
                                continue
                            } else {
                                codePoint = leadSurrogate - 55296 << 10 | codePoint - 56320 | 65536;
                                leadSurrogate = null
                            }
                        } else {
                            if (codePoint > 56319) {
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                continue
                            } else if (i + 1 === length) {
                                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                                continue
                            } else {
                                leadSurrogate = codePoint;
                                continue
                            }
                        }
                    } else if (leadSurrogate) {
                        if ((units -= 3) > -1) bytes.push(239, 191, 189);
                        leadSurrogate = null
                    }
                    if (codePoint < 128) {
                        if ((units -= 1) < 0) break;
                        bytes.push(codePoint)
                    } else if (codePoint < 2048) {
                        if ((units -= 2) < 0) break;
                        bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128)
                    } else if (codePoint < 65536) {
                        if ((units -= 3) < 0) break;
                        bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128)
                    } else if (codePoint < 2097152) {
                        if ((units -= 4) < 0) break;
                        bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128)
                    } else {
                        throw new Error("Invalid code point")
                    }
                }
                return bytes
            }

            function asciiToBytes(str) {
                var byteArray = [];
                for (var i = 0; i < str.length; i++) {
                    byteArray.push(str.charCodeAt(i) & 255)
                }
                return byteArray
            }

            function utf16leToBytes(str, units) {
                var c, hi, lo;
                var byteArray = [];
                for (var i = 0; i < str.length; i++) {
                    if ((units -= 2) < 0) break;
                    c = str.charCodeAt(i);
                    hi = c >> 8;
                    lo = c % 256;
                    byteArray.push(lo);
                    byteArray.push(hi)
                }
                return byteArray
            }

            function base64ToBytes(str) {
                return base64.toByteArray(base64clean(str))
            }

            function blitBuffer(src, dst, offset, length) {
                for (var i = 0; i < length; i++) {
                    if (i + offset >= dst.length || i >= src.length) break;
                    dst[i + offset] = src[i]
                }
                return i
            }

            function decodeUtf8Char(str) {
                try {
                    return decodeURIComponent(str)
                } catch (err) {
                    return String.fromCharCode(65533)
                }
            }
        }, {
            "base64-js": 4,
            ieee754: 5,
            "is-array": 6
        }],
        4: [function(require, module, exports) {
            var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            (function(exports) {
                "use strict";
                var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
                var PLUS = "+".charCodeAt(0);
                var SLASH = "/".charCodeAt(0);
                var NUMBER = "0".charCodeAt(0);
                var LOWER = "a".charCodeAt(0);
                var UPPER = "A".charCodeAt(0);
                var PLUS_URL_SAFE = "-".charCodeAt(0);
                var SLASH_URL_SAFE = "_".charCodeAt(0);

                function decode(elt) {
                    var code = elt.charCodeAt(0);
                    if (code === PLUS || code === PLUS_URL_SAFE) return 62;
                    if (code === SLASH || code === SLASH_URL_SAFE) return 63;
                    if (code < NUMBER) return -1;
                    if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
                    if (code < UPPER + 26) return code - UPPER;
                    if (code < LOWER + 26) return code - LOWER + 26
                }

                function b64ToByteArray(b64) {
                    var i, j, l, tmp, placeHolders, arr;
                    if (b64.length % 4 > 0) {
                        throw new Error("Invalid string. Length must be a multiple of 4")
                    }
                    var len = b64.length;
                    placeHolders = "=" === b64.charAt(len - 2) ? 2 : "=" === b64.charAt(len - 1) ? 1 : 0;
                    arr = new Arr(b64.length * 3 / 4 - placeHolders);
                    l = placeHolders > 0 ? b64.length - 4 : b64.length;
                    var L = 0;

                    function push(v) {
                        arr[L++] = v
                    }
                    for (i = 0, j = 0; i < l; i += 4, j += 3) {
                        tmp = decode(b64.charAt(i)) << 18 | decode(b64.charAt(i + 1)) << 12 | decode(b64.charAt(i + 2)) << 6 | decode(b64.charAt(i + 3));
                        push((tmp & 16711680) >> 16);
                        push((tmp & 65280) >> 8);
                        push(tmp & 255)
                    }
                    if (placeHolders === 2) {
                        tmp = decode(b64.charAt(i)) << 2 | decode(b64.charAt(i + 1)) >> 4;
                        push(tmp & 255)
                    } else if (placeHolders === 1) {
                        tmp = decode(b64.charAt(i)) << 10 | decode(b64.charAt(i + 1)) << 4 | decode(b64.charAt(i + 2)) >> 2;
                        push(tmp >> 8 & 255);
                        push(tmp & 255)
                    }
                    return arr
                }

                function uint8ToBase64(uint8) {
                    var i, extraBytes = uint8.length % 3,
                        output = "",
                        temp, length;

                    function encode(num) {
                        return lookup.charAt(num)
                    }

                    function tripletToBase64(num) {
                        return encode(num >> 18 & 63) + encode(num >> 12 & 63) + encode(num >> 6 & 63) + encode(num & 63)
                    }
                    for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
                        temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
                        output += tripletToBase64(temp)
                    }
                    switch (extraBytes) {
                        case 1:
                            temp = uint8[uint8.length - 1];
                            output += encode(temp >> 2);
                            output += encode(temp << 4 & 63);
                            output += "==";
                            break;
                        case 2:
                            temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
                            output += encode(temp >> 10);
                            output += encode(temp >> 4 & 63);
                            output += encode(temp << 2 & 63);
                            output += "=";
                            break
                    }
                    return output
                }
                exports.toByteArray = b64ToByteArray;
                exports.fromByteArray = uint8ToBase64
            })(typeof exports === "undefined" ? this.base64js = {} : exports)
        }, {}],
        5: [function(require, module, exports) {
            exports.read = function(buffer, offset, isLE, mLen, nBytes) {
                var e, m;
                var eLen = nBytes * 8 - mLen - 1;
                var eMax = (1 << eLen) - 1;
                var eBias = eMax >> 1;
                var nBits = -7;
                var i = isLE ? nBytes - 1 : 0;
                var d = isLE ? -1 : 1;
                var s = buffer[offset + i];
                i += d;
                e = s & (1 << -nBits) - 1;
                s >>= -nBits;
                nBits += eLen;
                for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
                m = e & (1 << -nBits) - 1;
                e >>= -nBits;
                nBits += mLen;
                for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
                if (e === 0) {
                    e = 1 - eBias
                } else if (e === eMax) {
                    return m ? NaN : (s ? -1 : 1) * Infinity
                } else {
                    m = m + Math.pow(2, mLen);
                    e = e - eBias
                }
                return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
            };
            exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
                var e, m, c;
                var eLen = nBytes * 8 - mLen - 1;
                var eMax = (1 << eLen) - 1;
                var eBias = eMax >> 1;
                var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
                var i = isLE ? 0 : nBytes - 1;
                var d = isLE ? 1 : -1;
                var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
                value = Math.abs(value);
                if (isNaN(value) || value === Infinity) {
                    m = isNaN(value) ? 1 : 0;
                    e = eMax
                } else {
                    e = Math.floor(Math.log(value) / Math.LN2);
                    if (value * (c = Math.pow(2, -e)) < 1) {
                        e--;
                        c *= 2
                    }
                    if (e + eBias >= 1) {
                        value += rt / c
                    } else {
                        value += rt * Math.pow(2, 1 - eBias)
                    }
                    if (value * c >= 2) {
                        e++;
                        c /= 2
                    }
                    if (e + eBias >= eMax) {
                        m = 0;
                        e = eMax
                    } else if (e + eBias >= 1) {
                        m = (value * c - 1) * Math.pow(2, mLen);
                        e = e + eBias
                    } else {
                        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                        e = 0
                    }
                }
                for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {}
                e = e << mLen | m;
                eLen += mLen;
                for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {}
                buffer[offset + i - d] |= s * 128
            }
        }, {}],
        6: [function(require, module, exports) {
            var isArray = Array.isArray;
            var str = Object.prototype.toString;
            module.exports = isArray || function(val) {
                return !!val && "[object Array]" == str.call(val)
            }
        }, {}],
        7: [function(require, module, exports) {
            function EventEmitter() {
                this._events = this._events || {};
                this._maxListeners = this._maxListeners || undefined
            }
            module.exports = EventEmitter;
            EventEmitter.EventEmitter = EventEmitter;
            EventEmitter.prototype._events = undefined;
            EventEmitter.prototype._maxListeners = undefined;
            EventEmitter.defaultMaxListeners = 10;
            EventEmitter.prototype.setMaxListeners = function(n) {
                if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
                this._maxListeners = n;
                return this
            };
            EventEmitter.prototype.emit = function(type) {
                var er, handler, len, args, i, listeners;
                if (!this._events) this._events = {};
                if (type === "error") {
                    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
                        er = arguments[1];
                        if (er instanceof Error) {
                            throw er
                        }
                        throw TypeError('Uncaught, unspecified "error" event.')
                    }
                }
                handler = this._events[type];
                if (isUndefined(handler)) return false;
                if (isFunction(handler)) {
                    switch (arguments.length) {
                        case 1:
                            handler.call(this);
                            break;
                        case 2:
                            handler.call(this, arguments[1]);
                            break;
                        case 3:
                            handler.call(this, arguments[1], arguments[2]);
                            break;
                        default:
                            len = arguments.length;
                            args = new Array(len - 1);
                            for (i = 1; i < len; i++) args[i - 1] = arguments[i];
                            handler.apply(this, args)
                    }
                } else if (isObject(handler)) {
                    len = arguments.length;
                    args = new Array(len - 1);
                    for (i = 1; i < len; i++) args[i - 1] = arguments[i];
                    listeners = handler.slice();
                    len = listeners.length;
                    for (i = 0; i < len; i++) listeners[i].apply(this, args)
                }
                return true
            };
            EventEmitter.prototype.addListener = function(type, listener) {
                var m;
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                if (!this._events) this._events = {};
                if (this._events.newListener) this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);
                if (!this._events[type]) this._events[type] = listener;
                else if (isObject(this._events[type])) this._events[type].push(listener);
                else this._events[type] = [this._events[type], listener];
                if (isObject(this._events[type]) && !this._events[type].warned) {
                    var m;
                    if (!isUndefined(this._maxListeners)) {
                        m = this._maxListeners
                    } else {
                        m = EventEmitter.defaultMaxListeners
                    }
                    if (m && m > 0 && this._events[type].length > m) {
                        this._events[type].warned = true;
                        console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
                        if (typeof console.trace === "function") {
                            console.trace()
                        }
                    }
                }
                return this
            };
            EventEmitter.prototype.on = EventEmitter.prototype.addListener;
            EventEmitter.prototype.once = function(type, listener) {
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                var fired = false;

                function g() {
                    this.removeListener(type, g);
                    if (!fired) {
                        fired = true;
                        listener.apply(this, arguments)
                    }
                }
                g.listener = listener;
                this.on(type, g);
                return this
            };
            EventEmitter.prototype.removeListener = function(type, listener) {
                var list, position, length, i;
                if (!isFunction(listener)) throw TypeError("listener must be a function");
                if (!this._events || !this._events[type]) return this;
                list = this._events[type];
                length = list.length;
                position = -1;
                if (list === listener || isFunction(list.listener) && list.listener === listener) {
                    delete this._events[type];
                    if (this._events.removeListener) this.emit("removeListener", type, listener)
                } else if (isObject(list)) {
                    for (i = length; i-- > 0;) {
                        if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                            position = i;
                            break
                        }
                    }
                    if (position < 0) return this;
                    if (list.length === 1) {
                        list.length = 0;
                        delete this._events[type]
                    } else {
                        list.splice(position, 1)
                    }
                    if (this._events.removeListener) this.emit("removeListener", type, listener)
                }
                return this
            };
            EventEmitter.prototype.removeAllListeners = function(type) {
                var key, listeners;
                if (!this._events) return this;
                if (!this._events.removeListener) {
                    if (arguments.length === 0) this._events = {};
                    else if (this._events[type]) delete this._events[type];
                    return this
                }
                if (arguments.length === 0) {
                    for (key in this._events) {
                        if (key === "removeListener") continue;
                        this.removeAllListeners(key)
                    }
                    this.removeAllListeners("removeListener");
                    this._events = {};
                    return this
                }
                listeners = this._events[type];
                if (isFunction(listeners)) {
                    this.removeListener(type, listeners)
                } else {
                    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1])
                }
                delete this._events[type];
                return this
            };
            EventEmitter.prototype.listeners = function(type) {
                var ret;
                if (!this._events || !this._events[type]) ret = [];
                else if (isFunction(this._events[type])) ret = [this._events[type]];
                else ret = this._events[type].slice();
                return ret
            };
            EventEmitter.listenerCount = function(emitter, type) {
                var ret;
                if (!emitter._events || !emitter._events[type]) ret = 0;
                else if (isFunction(emitter._events[type])) ret = 1;
                else ret = emitter._events[type].length;
                return ret
            };

            function isFunction(arg) {
                return typeof arg === "function"
            }

            function isNumber(arg) {
                return typeof arg === "number"
            }

            function isObject(arg) {
                return typeof arg === "object" && arg !== null
            }

            function isUndefined(arg) {
                return arg === void 0
            }
        }, {}],
        8: [function(require, module, exports) {
            if (typeof Object.create === "function") {
                module.exports = function inherits(ctor, superCtor) {
                    ctor.super_ = superCtor;
                    ctor.prototype = Object.create(superCtor.prototype, {
                        constructor: {
                            value: ctor,
                            enumerable: false,
                            writable: true,
                            configurable: true
                        }
                    })
                }
            } else {
                module.exports = function inherits(ctor, superCtor) {
                    ctor.super_ = superCtor;
                    var TempCtor = function() {};
                    TempCtor.prototype = superCtor.prototype;
                    ctor.prototype = new TempCtor;
                    ctor.prototype.constructor = ctor
                }
            }
        }, {}],
        9: [function(require, module, exports) {
            module.exports = Array.isArray || function(arr) {
                return Object.prototype.toString.call(arr) == "[object Array]"
            }
        }, {}],
        10: [function(require, module, exports) {
            var process = module.exports = {};
            var queue = [];
            var draining = false;

            function drainQueue() {
                if (draining) {
                    return
                }
                draining = true;
                var currentQueue;
                var len = queue.length;
                while (len) {
                    currentQueue = queue;
                    queue = [];
                    var i = -1;
                    while (++i < len) {
                        currentQueue[i]()
                    }
                    len = queue.length
                }
                draining = false
            }
            process.nextTick = function(fun) {
                queue.push(fun);
                if (!draining) {
                    setTimeout(drainQueue, 0)
                }
            };
            process.title = "browser";
            process.browser = true;
            process.env = {};
            process.argv = [];
            process.version = "";
            process.versions = {};

            function noop() {}
            process.on = noop;
            process.addListener = noop;
            process.once = noop;
            process.off = noop;
            process.removeListener = noop;
            process.removeAllListeners = noop;
            process.emit = noop;
            process.binding = function(name) {
                throw new Error("process.binding is not supported")
            };
            process.cwd = function() {
                return "/"
            };
            process.chdir = function(dir) {
                throw new Error("process.chdir is not supported")
            };
            process.umask = function() {
                return 0
            }
        }, {}],
        11: [function(require, module, exports) {
            (function(global) {
                (function(root) {
                    var freeExports = typeof exports == "object" && exports;
                    var freeModule = typeof module == "object" && module && module.exports == freeExports && module;
                    var freeGlobal = typeof global == "object" && global;
                    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
                        root = freeGlobal
                    }
                    var punycode, maxInt = 2147483647,
                        base = 36,
                        tMin = 1,
                        tMax = 26,
                        skew = 38,
                        damp = 700,
                        initialBias = 72,
                        initialN = 128,
                        delimiter = "-",
                        regexPunycode = /^xn--/,
                        regexNonASCII = /[^ -~]/,
                        regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g,
                        errors = {
                            overflow: "Overflow: input needs wider integers to process",
                            "not-basic": "Illegal input >= 0x80 (not a basic code point)",
                            "invalid-input": "Invalid input"
                        },
                        baseMinusTMin = base - tMin,
                        floor = Math.floor,
                        stringFromCharCode = String.fromCharCode,
                        key;

                    function error(type) {
                        throw RangeError(errors[type])
                    }

                    function map(array, fn) {
                        var length = array.length;
                        while (length--) {
                            array[length] = fn(array[length])
                        }
                        return array
                    }

                    function mapDomain(string, fn) {
                        return map(string.split(regexSeparators), fn).join(".")
                    }

                    function ucs2decode(string) {
                        var output = [],
                            counter = 0,
                            length = string.length,
                            value, extra;
                        while (counter < length) {
                            value = string.charCodeAt(counter++);
                            if (value >= 55296 && value <= 56319 && counter < length) {
                                extra = string.charCodeAt(counter++);
                                if ((extra & 64512) == 56320) {
                                    output.push(((value & 1023) << 10) + (extra & 1023) + 65536)
                                } else {
                                    output.push(value);
                                    counter--
                                }
                            } else {
                                output.push(value)
                            }
                        }
                        return output
                    }

                    function ucs2encode(array) {
                        return map(array, function(value) {
                            var output = "";
                            if (value > 65535) {
                                value -= 65536;
                                output += stringFromCharCode(value >>> 10 & 1023 | 55296);
                                value = 56320 | value & 1023
                            }
                            output += stringFromCharCode(value);
                            return output
                        }).join("")
                    }

                    function basicToDigit(codePoint) {
                        if (codePoint - 48 < 10) {
                            return codePoint - 22
                        }
                        if (codePoint - 65 < 26) {
                            return codePoint - 65
                        }
                        if (codePoint - 97 < 26) {
                            return codePoint - 97
                        }
                        return base
                    }

                    function digitToBasic(digit, flag) {
                        return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5)
                    }

                    function adapt(delta, numPoints, firstTime) {
                        var k = 0;
                        delta = firstTime ? floor(delta / damp) : delta >> 1;
                        delta += floor(delta / numPoints);
                        for (; delta > baseMinusTMin * tMax >> 1; k += base) {
                            delta = floor(delta / baseMinusTMin)
                        }
                        return floor(k + (baseMinusTMin + 1) * delta / (delta + skew))
                    }

                    function decode(input) {
                        var output = [],
                            inputLength = input.length,
                            out, i = 0,
                            n = initialN,
                            bias = initialBias,
                            basic, j, index, oldi, w, k, digit, t, baseMinusT;
                        basic = input.lastIndexOf(delimiter);
                        if (basic < 0) {
                            basic = 0
                        }
                        for (j = 0; j < basic; ++j) {
                            if (input.charCodeAt(j) >= 128) {
                                error("not-basic")
                            }
                            output.push(input.charCodeAt(j))
                        }
                        for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) {
                            for (oldi = i, w = 1, k = base;; k += base) {
                                if (index >= inputLength) {
                                    error("invalid-input")
                                }
                                digit = basicToDigit(input.charCodeAt(index++));
                                if (digit >= base || digit > floor((maxInt - i) / w)) {
                                    error("overflow")
                                }
                                i += digit * w;
                                t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                                if (digit < t) {
                                    break
                                }
                                baseMinusT = base - t;
                                if (w > floor(maxInt / baseMinusT)) {
                                    error("overflow")
                                }
                                w *= baseMinusT
                            }
                            out = output.length + 1;
                            bias = adapt(i - oldi, out, oldi == 0);
                            if (floor(i / out) > maxInt - n) {
                                error("overflow")
                            }
                            n += floor(i / out);
                            i %= out;
                            output.splice(i++, 0, n)
                        }
                        return ucs2encode(output)
                    }

                    function encode(input) {
                        var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [],
                            inputLength, handledCPCountPlusOne, baseMinusT, qMinusT;
                        input = ucs2decode(input);
                        inputLength = input.length;
                        n = initialN;
                        delta = 0;
                        bias = initialBias;
                        for (j = 0; j < inputLength; ++j) {
                            currentValue = input[j];
                            if (currentValue < 128) {
                                output.push(stringFromCharCode(currentValue))
                            }
                        }
                        handledCPCount = basicLength = output.length;
                        if (basicLength) {
                            output.push(delimiter)
                        }
                        while (handledCPCount < inputLength) {
                            for (m = maxInt, j = 0; j < inputLength; ++j) {
                                currentValue = input[j];
                                if (currentValue >= n && currentValue < m) {
                                    m = currentValue
                                }
                            }
                            handledCPCountPlusOne = handledCPCount + 1;
                            if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                                error("overflow")
                            }
                            delta += (m - n) * handledCPCountPlusOne;
                            n = m;
                            for (j = 0; j < inputLength; ++j) {
                                currentValue = input[j];
                                if (currentValue < n && ++delta > maxInt) {
                                    error("overflow")
                                }
                                if (currentValue == n) {
                                    for (q = delta, k = base;; k += base) {
                                        t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                                        if (q < t) {
                                            break
                                        }
                                        qMinusT = q - t;
                                        baseMinusT = base - t;
                                        output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                                        q = floor(qMinusT / baseMinusT)
                                    }
                                    output.push(stringFromCharCode(digitToBasic(q, 0)));
                                    bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                                    delta = 0;
                                    ++handledCPCount
                                }
                            }++delta;
                            ++n
                        }
                        return output.join("")
                    }

                    function toUnicode(domain) {
                        return mapDomain(domain, function(string) {
                            return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string
                        })
                    }

                    function toASCII(domain) {
                        return mapDomain(domain, function(string) {
                            return regexNonASCII.test(string) ? "xn--" + encode(string) : string
                        })
                    }
                    punycode = {
                        version: "1.2.4",
                        ucs2: {
                            decode: ucs2decode,
                            encode: ucs2encode
                        },
                        decode: decode,
                        encode: encode,
                        toASCII: toASCII,
                        toUnicode: toUnicode
                    };
                    if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
                        define("punycode", function() {
                            return punycode
                        })
                    } else if (freeExports && !freeExports.nodeType) {
                        if (freeModule) {
                            freeModule.exports = punycode
                        } else {
                            for (key in punycode) {
                                punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key])
                            }
                        }
                    } else {
                        root.punycode = punycode
                    }
                })(this)
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {}],
        12: [function(require, module, exports) {
            "use strict";

            function hasOwnProperty(obj, prop) {
                return Object.prototype.hasOwnProperty.call(obj, prop)
            }
            module.exports = function(qs, sep, eq, options) {
                sep = sep || "&";
                eq = eq || "=";
                var obj = {};
                if (typeof qs !== "string" || qs.length === 0) {
                    return obj
                }
                var regexp = /\+/g;
                qs = qs.split(sep);
                var maxKeys = 1e3;
                if (options && typeof options.maxKeys === "number") {
                    maxKeys = options.maxKeys
                }
                var len = qs.length;
                if (maxKeys > 0 && len > maxKeys) {
                    len = maxKeys
                }
                for (var i = 0; i < len; ++i) {
                    var x = qs[i].replace(regexp, "%20"),
                        idx = x.indexOf(eq),
                        kstr, vstr, k, v;
                    if (idx >= 0) {
                        kstr = x.substr(0, idx);
                        vstr = x.substr(idx + 1)
                    } else {
                        kstr = x;
                        vstr = ""
                    }
                    k = decodeURIComponent(kstr);
                    v = decodeURIComponent(vstr);
                    if (!hasOwnProperty(obj, k)) {
                        obj[k] = v
                    } else if (isArray(obj[k])) {
                        obj[k].push(v)
                    } else {
                        obj[k] = [obj[k], v]
                    }
                }
                return obj
            };
            var isArray = Array.isArray || function(xs) {
                return Object.prototype.toString.call(xs) === "[object Array]"
            }
        }, {}],
        13: [function(require, module, exports) {
            "use strict";
            var stringifyPrimitive = function(v) {
                switch (typeof v) {
                    case "string":
                        return v;
                    case "boolean":
                        return v ? "true" : "false";
                    case "number":
                        return isFinite(v) ? v : "";
                    default:
                        return ""
                }
            };
            module.exports = function(obj, sep, eq, name) {
                sep = sep || "&";
                eq = eq || "=";
                if (obj === null) {
                    obj = undefined
                }
                if (typeof obj === "object") {
                    return map(objectKeys(obj), function(k) {
                        var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
                        if (isArray(obj[k])) {
                            return map(obj[k], function(v) {
                                return ks + encodeURIComponent(stringifyPrimitive(v))
                            }).join(sep)
                        } else {
                            return ks + encodeURIComponent(stringifyPrimitive(obj[k]))
                        }
                    }).join(sep)
                }
                if (!name) return "";
                return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj))
            };
            var isArray = Array.isArray || function(xs) {
                return Object.prototype.toString.call(xs) === "[object Array]"
            };

            function map(xs, f) {
                if (xs.map) return xs.map(f);
                var res = [];
                for (var i = 0; i < xs.length; i++) {
                    res.push(f(xs[i], i))
                }
                return res
            }
            var objectKeys = Object.keys || function(obj) {
                var res = [];
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key)
                }
                return res
            }
        }, {}],
        14: [function(require, module, exports) {
            "use strict";
            exports.decode = exports.parse = require("./decode");
            exports.encode = exports.stringify = require("./encode")
        }, {
            "./decode": 12,
            "./encode": 13
        }],
        15: [function(require, module, exports) {
            module.exports = require("./lib/_stream_duplex.js")
        }, {
            "./lib/_stream_duplex.js": 16
        }],
        16: [function(require, module, exports) {
            (function(process) {
                module.exports = Duplex;
                var objectKeys = Object.keys || function(obj) {
                    var keys = [];
                    for (var key in obj) keys.push(key);
                    return keys
                };
                var util = require("core-util-is");
                util.inherits = require("inherits");
                var Readable = require("./_stream_readable");
                var Writable = require("./_stream_writable");
                util.inherits(Duplex, Readable);
                forEach(objectKeys(Writable.prototype), function(method) {
                    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method]
                });

                function Duplex(options) {
                    if (!(this instanceof Duplex)) return new Duplex(options);
                    Readable.call(this, options);
                    Writable.call(this, options);
                    if (options && options.readable === false) this.readable = false;
                    if (options && options.writable === false) this.writable = false;
                    this.allowHalfOpen = true;
                    if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
                    this.once("end", onend)
                }

                function onend() {
                    if (this.allowHalfOpen || this._writableState.ended) return;
                    process.nextTick(this.end.bind(this))
                }

                function forEach(xs, f) {
                    for (var i = 0, l = xs.length; i < l; i++) {
                        f(xs[i], i)
                    }
                }
            }).call(this, require("_process"))
        }, {
            "./_stream_readable": 18,
            "./_stream_writable": 20,
            _process: 10,
            "core-util-is": 21,
            inherits: 8
        }],
        17: [function(require, module, exports) {
            module.exports = PassThrough;
            var Transform = require("./_stream_transform");
            var util = require("core-util-is");
            util.inherits = require("inherits");
            util.inherits(PassThrough, Transform);

            function PassThrough(options) {
                if (!(this instanceof PassThrough)) return new PassThrough(options);
                Transform.call(this, options)
            }
            PassThrough.prototype._transform = function(chunk, encoding, cb) {
                cb(null, chunk)
            }
        }, {
            "./_stream_transform": 19,
            "core-util-is": 21,
            inherits: 8
        }],
        18: [function(require, module, exports) {
            (function(process) {
                module.exports = Readable;
                var isArray = require("isarray");
                var Buffer = require("buffer").Buffer;
                Readable.ReadableState = ReadableState;
                var EE = require("events").EventEmitter;
                if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
                    return emitter.listeners(type).length
                };
                var Stream = require("stream");
                var util = require("core-util-is");
                util.inherits = require("inherits");
                var StringDecoder;
                var debug = require("util");
                if (debug && debug.debuglog) {
                    debug = debug.debuglog("stream")
                } else {
                    debug = function() {}
                }
                util.inherits(Readable, Stream);

                function ReadableState(options, stream) {
                    var Duplex = require("./_stream_duplex");
                    options = options || {};
                    var hwm = options.highWaterMark;
                    var defaultHwm = options.objectMode ? 16 : 16 * 1024;
                    this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
                    this.highWaterMark = ~~this.highWaterMark;
                    this.buffer = [];
                    this.length = 0;
                    this.pipes = null;
                    this.pipesCount = 0;
                    this.flowing = null;
                    this.ended = false;
                    this.endEmitted = false;
                    this.reading = false;
                    this.sync = true;
                    this.needReadable = false;
                    this.emittedReadable = false;
                    this.readableListening = false;
                    this.objectMode = !!options.objectMode;
                    if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
                    this.defaultEncoding = options.defaultEncoding || "utf8";
                    this.ranOut = false;
                    this.awaitDrain = 0;
                    this.readingMore = false;
                    this.decoder = null;
                    this.encoding = null;
                    if (options.encoding) {
                        if (!StringDecoder) StringDecoder = require("string_decoder/").StringDecoder;
                        this.decoder = new StringDecoder(options.encoding);
                        this.encoding = options.encoding
                    }
                }

                function Readable(options) {
                    var Duplex = require("./_stream_duplex");
                    if (!(this instanceof Readable)) return new Readable(options);
                    this._readableState = new ReadableState(options, this);
                    this.readable = true;
                    Stream.call(this)
                }
                Readable.prototype.push = function(chunk, encoding) {
                    var state = this._readableState;
                    if (util.isString(chunk) && !state.objectMode) {
                        encoding = encoding || state.defaultEncoding;
                        if (encoding !== state.encoding) {
                            chunk = new Buffer(chunk, encoding);
                            encoding = ""
                        }
                    }
                    return readableAddChunk(this, state, chunk, encoding, false)
                };
                Readable.prototype.unshift = function(chunk) {
                    var state = this._readableState;
                    return readableAddChunk(this, state, chunk, "", true)
                };

                function readableAddChunk(stream, state, chunk, encoding, addToFront) {
                    var er = chunkInvalid(state, chunk);
                    if (er) {
                        stream.emit("error", er)
                    } else if (util.isNullOrUndefined(chunk)) {
                        state.reading = false;
                        if (!state.ended) onEofChunk(stream, state)
                    } else if (state.objectMode || chunk && chunk.length > 0) {
                        if (state.ended && !addToFront) {
                            var e = new Error("stream.push() after EOF");
                            stream.emit("error", e)
                        } else if (state.endEmitted && addToFront) {
                            var e = new Error("stream.unshift() after end event");
                            stream.emit("error", e)
                        } else {
                            if (state.decoder && !addToFront && !encoding) chunk = state.decoder.write(chunk);
                            if (!addToFront) state.reading = false;
                            if (state.flowing && state.length === 0 && !state.sync) {
                                stream.emit("data", chunk);
                                stream.read(0)
                            } else {
                                state.length += state.objectMode ? 1 : chunk.length;
                                if (addToFront) state.buffer.unshift(chunk);
                                else state.buffer.push(chunk);
                                if (state.needReadable) emitReadable(stream)
                            }
                            maybeReadMore(stream, state)
                        }
                    } else if (!addToFront) {
                        state.reading = false
                    }
                    return needMoreData(state)
                }

                function needMoreData(state) {
                    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0)
                }
                Readable.prototype.setEncoding = function(enc) {
                    if (!StringDecoder) StringDecoder = require("string_decoder/").StringDecoder;
                    this._readableState.decoder = new StringDecoder(enc);
                    this._readableState.encoding = enc;
                    return this
                };
                var MAX_HWM = 8388608;

                function roundUpToNextPowerOf2(n) {
                    if (n >= MAX_HWM) {
                        n = MAX_HWM
                    } else {
                        n--;
                        for (var p = 1; p < 32; p <<= 1) n |= n >> p;
                        n++
                    }
                    return n
                }

                function howMuchToRead(n, state) {
                    if (state.length === 0 && state.ended) return 0;
                    if (state.objectMode) return n === 0 ? 0 : 1;
                    if (isNaN(n) || util.isNull(n)) {
                        if (state.flowing && state.buffer.length) return state.buffer[0].length;
                        else return state.length
                    }
                    if (n <= 0) return 0;
                    if (n > state.highWaterMark) state.highWaterMark = roundUpToNextPowerOf2(n);
                    if (n > state.length) {
                        if (!state.ended) {
                            state.needReadable = true;
                            return 0
                        } else return state.length
                    }
                    return n
                }
                Readable.prototype.read = function(n) {
                    debug("read", n);
                    var state = this._readableState;
                    var nOrig = n;
                    if (!util.isNumber(n) || n > 0) state.emittedReadable = false;
                    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
                        debug("read: emitReadable", state.length, state.ended);
                        if (state.length === 0 && state.ended) endReadable(this);
                        else emitReadable(this);
                        return null
                    }
                    n = howMuchToRead(n, state);
                    if (n === 0 && state.ended) {
                        if (state.length === 0) endReadable(this);
                        return null
                    }
                    var doRead = state.needReadable;
                    debug("need readable", doRead);
                    if (state.length === 0 || state.length - n < state.highWaterMark) {
                        doRead = true;
                        debug("length less than watermark", doRead)
                    }
                    if (state.ended || state.reading) {
                        doRead = false;
                        debug("reading or ended", doRead)
                    }
                    if (doRead) {
                        debug("do read");
                        state.reading = true;
                        state.sync = true;
                        if (state.length === 0) state.needReadable = true;
                        this._read(state.highWaterMark);
                        state.sync = false
                    }
                    if (doRead && !state.reading) n = howMuchToRead(nOrig, state);
                    var ret;
                    if (n > 0) ret = fromList(n, state);
                    else ret = null;
                    if (util.isNull(ret)) {
                        state.needReadable = true;
                        n = 0
                    }
                    state.length -= n;
                    if (state.length === 0 && !state.ended) state.needReadable = true;
                    if (nOrig !== n && state.ended && state.length === 0) endReadable(this);
                    if (!util.isNull(ret)) this.emit("data", ret);
                    return ret
                };

                function chunkInvalid(state, chunk) {
                    var er = null;
                    if (!util.isBuffer(chunk) && !util.isString(chunk) && !util.isNullOrUndefined(chunk) && !state.objectMode) {
                        er = new TypeError("Invalid non-string/buffer chunk")
                    }
                    return er
                }

                function onEofChunk(stream, state) {
                    if (state.decoder && !state.ended) {
                        var chunk = state.decoder.end();
                        if (chunk && chunk.length) {
                            state.buffer.push(chunk);
                            state.length += state.objectMode ? 1 : chunk.length
                        }
                    }
                    state.ended = true;
                    emitReadable(stream)
                }

                function emitReadable(stream) {
                    var state = stream._readableState;
                    state.needReadable = false;
                    if (!state.emittedReadable) {
                        debug("emitReadable", state.flowing);
                        state.emittedReadable = true;
                        if (state.sync) process.nextTick(function() {
                            emitReadable_(stream)
                        });
                        else emitReadable_(stream)
                    }
                }

                function emitReadable_(stream) {
                    debug("emit readable");
                    stream.emit("readable");
                    flow(stream)
                }

                function maybeReadMore(stream, state) {
                    if (!state.readingMore) {
                        state.readingMore = true;
                        process.nextTick(function() {
                            maybeReadMore_(stream, state)
                        })
                    }
                }

                function maybeReadMore_(stream, state) {
                    var len = state.length;
                    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
                        debug("maybeReadMore read 0");
                        stream.read(0);
                        if (len === state.length) break;
                        else len = state.length
                    }
                    state.readingMore = false
                }
                Readable.prototype._read = function(n) {
                    this.emit("error", new Error("not implemented"))
                };
                Readable.prototype.pipe = function(dest, pipeOpts) {
                    var src = this;
                    var state = this._readableState;
                    switch (state.pipesCount) {
                        case 0:
                            state.pipes = dest;
                            break;
                        case 1:
                            state.pipes = [state.pipes, dest];
                            break;
                        default:
                            state.pipes.push(dest);
                            break
                    }
                    state.pipesCount += 1;
                    debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
                    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
                    var endFn = doEnd ? onend : cleanup;
                    if (state.endEmitted) process.nextTick(endFn);
                    else src.once("end", endFn);
                    dest.on("unpipe", onunpipe);

                    function onunpipe(readable) {
                        debug("onunpipe");
                        if (readable === src) {
                            cleanup()
                        }
                    }

                    function onend() {
                        debug("onend");
                        dest.end()
                    }
                    var ondrain = pipeOnDrain(src);
                    dest.on("drain", ondrain);

                    function cleanup() {
                        debug("cleanup");
                        dest.removeListener("close", onclose);
                        dest.removeListener("finish", onfinish);
                        dest.removeListener("drain", ondrain);
                        dest.removeListener("error", onerror);
                        dest.removeListener("unpipe", onunpipe);
                        src.removeListener("end", onend);
                        src.removeListener("end", cleanup);
                        src.removeListener("data", ondata);
                        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain()
                    }
                    src.on("data", ondata);

                    function ondata(chunk) {
                        debug("ondata");
                        var ret = dest.write(chunk);
                        if (false === ret) {
                            debug("false write response, pause", src._readableState.awaitDrain);
                            src._readableState.awaitDrain++;
                            src.pause()
                        }
                    }

                    function onerror(er) {
                        debug("onerror", er);
                        unpipe();
                        dest.removeListener("error", onerror);
                        if (EE.listenerCount(dest, "error") === 0) dest.emit("error", er)
                    }
                    if (!dest._events || !dest._events.error) dest.on("error", onerror);
                    else if (isArray(dest._events.error)) dest._events.error.unshift(onerror);
                    else dest._events.error = [onerror, dest._events.error];

                    function onclose() {
                        dest.removeListener("finish", onfinish);
                        unpipe()
                    }
                    dest.once("close", onclose);

                    function onfinish() {
                        debug("onfinish");
                        dest.removeListener("close", onclose);
                        unpipe()
                    }
                    dest.once("finish", onfinish);

                    function unpipe() {
                        debug("unpipe");
                        src.unpipe(dest)
                    }
                    dest.emit("pipe", src);
                    if (!state.flowing) {
                        debug("pipe resume");
                        src.resume()
                    }
                    return dest
                };

                function pipeOnDrain(src) {
                    return function() {
                        var state = src._readableState;
                        debug("pipeOnDrain", state.awaitDrain);
                        if (state.awaitDrain) state.awaitDrain--;
                        if (state.awaitDrain === 0 && EE.listenerCount(src, "data")) {
                            state.flowing = true;
                            flow(src)
                        }
                    }
                }
                Readable.prototype.unpipe = function(dest) {
                    var state = this._readableState;
                    if (state.pipesCount === 0) return this;
                    if (state.pipesCount === 1) {
                        if (dest && dest !== state.pipes) return this;
                        if (!dest) dest = state.pipes;
                        state.pipes = null;
                        state.pipesCount = 0;
                        state.flowing = false;
                        if (dest) dest.emit("unpipe", this);
                        return this
                    }
                    if (!dest) {
                        var dests = state.pipes;
                        var len = state.pipesCount;
                        state.pipes = null;
                        state.pipesCount = 0;
                        state.flowing = false;
                        for (var i = 0; i < len; i++) dests[i].emit("unpipe", this);
                        return this
                    }
                    var i = indexOf(state.pipes, dest);
                    if (i === -1) return this;
                    state.pipes.splice(i, 1);
                    state.pipesCount -= 1;
                    if (state.pipesCount === 1) state.pipes = state.pipes[0];
                    dest.emit("unpipe", this);
                    return this
                };
                Readable.prototype.on = function(ev, fn) {
                    var res = Stream.prototype.on.call(this, ev, fn);
                    if (ev === "data" && false !== this._readableState.flowing) {
                        this.resume()
                    }
                    if (ev === "readable" && this.readable) {
                        var state = this._readableState;
                        if (!state.readableListening) {
                            state.readableListening = true;
                            state.emittedReadable = false;
                            state.needReadable = true;
                            if (!state.reading) {
                                var self = this;
                                process.nextTick(function() {
                                    debug("readable nexttick read 0");
                                    self.read(0)
                                })
                            } else if (state.length) {
                                emitReadable(this, state)
                            }
                        }
                    }
                    return res
                };
                Readable.prototype.addListener = Readable.prototype.on;
                Readable.prototype.resume = function() {
                    var state = this._readableState;
                    if (!state.flowing) {
                        debug("resume");
                        state.flowing = true;
                        if (!state.reading) {
                            debug("resume read 0");
                            this.read(0)
                        }
                        resume(this, state)
                    }
                    return this
                };

                function resume(stream, state) {
                    if (!state.resumeScheduled) {
                        state.resumeScheduled = true;
                        process.nextTick(function() {
                            resume_(stream, state)
                        })
                    }
                }

                function resume_(stream, state) {
                    state.resumeScheduled = false;
                    stream.emit("resume");
                    flow(stream);
                    if (state.flowing && !state.reading) stream.read(0)
                }
                Readable.prototype.pause = function() {
                    debug("call pause flowing=%j", this._readableState.flowing);
                    if (false !== this._readableState.flowing) {
                        debug("pause");
                        this._readableState.flowing = false;
                        this.emit("pause")
                    }
                    return this
                };

                function flow(stream) {
                    var state = stream._readableState;
                    debug("flow", state.flowing);
                    if (state.flowing) {
                        do {
                            var chunk = stream.read()
                        } while (null !== chunk && state.flowing)
                    }
                }
                Readable.prototype.wrap = function(stream) {
                    var state = this._readableState;
                    var paused = false;
                    var self = this;
                    stream.on("end", function() {
                        debug("wrapped end");
                        if (state.decoder && !state.ended) {
                            var chunk = state.decoder.end();
                            if (chunk && chunk.length) self.push(chunk)
                        }
                        self.push(null)
                    });
                    stream.on("data", function(chunk) {
                        debug("wrapped data");
                        if (state.decoder) chunk = state.decoder.write(chunk);
                        if (!chunk || !state.objectMode && !chunk.length) return;
                        var ret = self.push(chunk);
                        if (!ret) {
                            paused = true;
                            stream.pause()
                        }
                    });
                    for (var i in stream) {
                        if (util.isFunction(stream[i]) && util.isUndefined(this[i])) {
                            this[i] = function(method) {
                                return function() {
                                    return stream[method].apply(stream, arguments)
                                }
                            }(i)
                        }
                    }
                    var events = ["error", "close", "destroy", "pause", "resume"];
                    forEach(events, function(ev) {
                        stream.on(ev, self.emit.bind(self, ev))
                    });
                    self._read = function(n) {
                        debug("wrapped _read", n);
                        if (paused) {
                            paused = false;
                            stream.resume()
                        }
                    };
                    return self
                };
                Readable._fromList = fromList;

                function fromList(n, state) {
                    var list = state.buffer;
                    var length = state.length;
                    var stringMode = !!state.decoder;
                    var objectMode = !!state.objectMode;
                    var ret;
                    if (list.length === 0) return null;
                    if (length === 0) ret = null;
                    else if (objectMode) ret = list.shift();
                    else if (!n || n >= length) {
                        if (stringMode) ret = list.join("");
                        else ret = Buffer.concat(list, length);
                        list.length = 0
                    } else {
                        if (n < list[0].length) {
                            var buf = list[0];
                            ret = buf.slice(0, n);
                            list[0] = buf.slice(n)
                        } else if (n === list[0].length) {
                            ret = list.shift()
                        } else {
                            if (stringMode) ret = "";
                            else ret = new Buffer(n);
                            var c = 0;
                            for (var i = 0, l = list.length; i < l && c < n; i++) {
                                var buf = list[0];
                                var cpy = Math.min(n - c, buf.length);
                                if (stringMode) ret += buf.slice(0, cpy);
                                else buf.copy(ret, c, 0, cpy);
                                if (cpy < buf.length) list[0] = buf.slice(cpy);
                                else list.shift();
                                c += cpy
                            }
                        }
                    }
                    return ret
                }

                function endReadable(stream) {
                    var state = stream._readableState;
                    if (state.length > 0) throw new Error("endReadable called on non-empty stream");
                    if (!state.endEmitted) {
                        state.ended = true;
                        process.nextTick(function() {
                            if (!state.endEmitted && state.length === 0) {
                                state.endEmitted = true;
                                stream.readable = false;
                                stream.emit("end")
                            }
                        })
                    }
                }

                function forEach(xs, f) {
                    for (var i = 0, l = xs.length; i < l; i++) {
                        f(xs[i], i)
                    }
                }

                function indexOf(xs, x) {
                    for (var i = 0, l = xs.length; i < l; i++) {
                        if (xs[i] === x) return i
                    }
                    return -1
                }
            }).call(this, require("_process"))
        }, {
            "./_stream_duplex": 16,
            _process: 10,
            buffer: 3,
            "core-util-is": 21,
            events: 7,
            inherits: 8,
            isarray: 9,
            stream: 26,
            "string_decoder/": 27,
            util: 2
        }],
        19: [function(require, module, exports) {
            module.exports = Transform;
            var Duplex = require("./_stream_duplex");
            var util = require("core-util-is");
            util.inherits = require("inherits");
            util.inherits(Transform, Duplex);

            function TransformState(options, stream) {
                this.afterTransform = function(er, data) {
                    return afterTransform(stream, er, data)
                };
                this.needTransform = false;
                this.transforming = false;
                this.writecb = null;
                this.writechunk = null
            }

            function afterTransform(stream, er, data) {
                var ts = stream._transformState;
                ts.transforming = false;
                var cb = ts.writecb;
                if (!cb) return stream.emit("error", new Error("no writecb in Transform class"));
                ts.writechunk = null;
                ts.writecb = null;
                if (!util.isNullOrUndefined(data)) stream.push(data);
                if (cb) cb(er);
                var rs = stream._readableState;
                rs.reading = false;
                if (rs.needReadable || rs.length < rs.highWaterMark) {
                    stream._read(rs.highWaterMark)
                }
            }

            function Transform(options) {
                if (!(this instanceof Transform)) return new Transform(options);
                Duplex.call(this, options);
                this._transformState = new TransformState(options, this);
                var stream = this;
                this._readableState.needReadable = true;
                this._readableState.sync = false;
                this.once("prefinish", function() {
                    if (util.isFunction(this._flush)) this._flush(function(er) {
                        done(stream, er)
                    });
                    else done(stream)
                })
            }
            Transform.prototype.push = function(chunk, encoding) {
                this._transformState.needTransform = false;
                return Duplex.prototype.push.call(this, chunk, encoding)
            };
            Transform.prototype._transform = function(chunk, encoding, cb) {
                throw new Error("not implemented")
            };
            Transform.prototype._write = function(chunk, encoding, cb) {
                var ts = this._transformState;
                ts.writecb = cb;
                ts.writechunk = chunk;
                ts.writeencoding = encoding;
                if (!ts.transforming) {
                    var rs = this._readableState;
                    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark)
                }
            };
            Transform.prototype._read = function(n) {
                var ts = this._transformState;
                if (!util.isNull(ts.writechunk) && ts.writecb && !ts.transforming) {
                    ts.transforming = true;
                    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform)
                } else {
                    ts.needTransform = true
                }
            };

            function done(stream, er) {
                if (er) return stream.emit("error", er);
                var ws = stream._writableState;
                var ts = stream._transformState;
                if (ws.length) throw new Error("calling transform done when ws.length != 0");
                if (ts.transforming) throw new Error("calling transform done when still transforming");
                return stream.push(null)
            }
        }, {
            "./_stream_duplex": 16,
            "core-util-is": 21,
            inherits: 8
        }],
        20: [function(require, module, exports) {
            (function(process) {
                module.exports = Writable;
                var Buffer = require("buffer").Buffer;
                Writable.WritableState = WritableState;
                var util = require("core-util-is");
                util.inherits = require("inherits");
                var Stream = require("stream");
                util.inherits(Writable, Stream);

                function WriteReq(chunk, encoding, cb) {
                    this.chunk = chunk;
                    this.encoding = encoding;
                    this.callback = cb
                }

                function WritableState(options, stream) {
                    var Duplex = require("./_stream_duplex");
                    options = options || {};
                    var hwm = options.highWaterMark;
                    var defaultHwm = options.objectMode ? 16 : 16 * 1024;
                    this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
                    this.objectMode = !!options.objectMode;
                    if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
                    this.highWaterMark = ~~this.highWaterMark;
                    this.needDrain = false;
                    this.ending = false;
                    this.ended = false;
                    this.finished = false;
                    var noDecode = options.decodeStrings === false;
                    this.decodeStrings = !noDecode;
                    this.defaultEncoding = options.defaultEncoding || "utf8";
                    this.length = 0;
                    this.writing = false;
                    this.corked = 0;
                    this.sync = true;
                    this.bufferProcessing = false;
                    this.onwrite = function(er) {
                        onwrite(stream, er)
                    };
                    this.writecb = null;
                    this.writelen = 0;
                    this.buffer = [];
                    this.pendingcb = 0;
                    this.prefinished = false;
                    this.errorEmitted = false
                }

                function Writable(options) {
                    var Duplex = require("./_stream_duplex");
                    if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);
                    this._writableState = new WritableState(options, this);
                    this.writable = true;
                    Stream.call(this)
                }
                Writable.prototype.pipe = function() {
                    this.emit("error", new Error("Cannot pipe. Not readable."))
                };

                function writeAfterEnd(stream, state, cb) {
                    var er = new Error("write after end");
                    stream.emit("error", er);
                    process.nextTick(function() {
                        cb(er)
                    })
                }

                function validChunk(stream, state, chunk, cb) {
                    var valid = true;
                    if (!util.isBuffer(chunk) && !util.isString(chunk) && !util.isNullOrUndefined(chunk) && !state.objectMode) {
                        var er = new TypeError("Invalid non-string/buffer chunk");
                        stream.emit("error", er);
                        process.nextTick(function() {
                            cb(er)
                        });
                        valid = false
                    }
                    return valid
                }
                Writable.prototype.write = function(chunk, encoding, cb) {
                    var state = this._writableState;
                    var ret = false;
                    if (util.isFunction(encoding)) {
                        cb = encoding;
                        encoding = null
                    }
                    if (util.isBuffer(chunk)) encoding = "buffer";
                    else if (!encoding) encoding = state.defaultEncoding;
                    if (!util.isFunction(cb)) cb = function() {};
                    if (state.ended) writeAfterEnd(this, state, cb);
                    else if (validChunk(this, state, chunk, cb)) {
                        state.pendingcb++;
                        ret = writeOrBuffer(this, state, chunk, encoding, cb)
                    }
                    return ret
                };
                Writable.prototype.cork = function() {
                    var state = this._writableState;
                    state.corked++
                };
                Writable.prototype.uncork = function() {
                    var state = this._writableState;
                    if (state.corked) {
                        state.corked--;
                        if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.buffer.length) clearBuffer(this, state)
                    }
                };

                function decodeChunk(state, chunk, encoding) {
                    if (!state.objectMode && state.decodeStrings !== false && util.isString(chunk)) {
                        chunk = new Buffer(chunk, encoding)
                    }
                    return chunk
                }

                function writeOrBuffer(stream, state, chunk, encoding, cb) {
                    chunk = decodeChunk(state, chunk, encoding);
                    if (util.isBuffer(chunk)) encoding = "buffer";
                    var len = state.objectMode ? 1 : chunk.length;
                    state.length += len;
                    var ret = state.length < state.highWaterMark;
                    if (!ret) state.needDrain = true;
                    if (state.writing || state.corked) state.buffer.push(new WriteReq(chunk, encoding, cb));
                    else doWrite(stream, state, false, len, chunk, encoding, cb);
                    return ret
                }

                function doWrite(stream, state, writev, len, chunk, encoding, cb) {
                    state.writelen = len;
                    state.writecb = cb;
                    state.writing = true;
                    state.sync = true;
                    if (writev) stream._writev(chunk, state.onwrite);
                    else stream._write(chunk, encoding, state.onwrite);
                    state.sync = false
                }

                function onwriteError(stream, state, sync, er, cb) {
                    if (sync) process.nextTick(function() {
                        state.pendingcb--;
                        cb(er)
                    });
                    else {
                        state.pendingcb--;
                        cb(er)
                    }
                    stream._writableState.errorEmitted = true;
                    stream.emit("error", er)
                }

                function onwriteStateUpdate(state) {
                    state.writing = false;
                    state.writecb = null;
                    state.length -= state.writelen;
                    state.writelen = 0
                }

                function onwrite(stream, er) {
                    var state = stream._writableState;
                    var sync = state.sync;
                    var cb = state.writecb;
                    onwriteStateUpdate(state);
                    if (er) onwriteError(stream, state, sync, er, cb);
                    else {
                        var finished = needFinish(stream, state);
                        if (!finished && !state.corked && !state.bufferProcessing && state.buffer.length) {
                            clearBuffer(stream, state)
                        }
                        if (sync) {
                            process.nextTick(function() {
                                afterWrite(stream, state, finished, cb)
                            })
                        } else {
                            afterWrite(stream, state, finished, cb)
                        }
                    }
                }

                function afterWrite(stream, state, finished, cb) {
                    if (!finished) onwriteDrain(stream, state);
                    state.pendingcb--;
                    cb();
                    finishMaybe(stream, state)
                }

                function onwriteDrain(stream, state) {
                    if (state.length === 0 && state.needDrain) {
                        state.needDrain = false;
                        stream.emit("drain")
                    }
                }

                function clearBuffer(stream, state) {
                    state.bufferProcessing = true;
                    if (stream._writev && state.buffer.length > 1) {
                        var cbs = [];
                        for (var c = 0; c < state.buffer.length; c++) cbs.push(state.buffer[c].callback);
                        state.pendingcb++;
                        doWrite(stream, state, true, state.length, state.buffer, "", function(err) {
                            for (var i = 0; i < cbs.length; i++) {
                                state.pendingcb--;
                                cbs[i](err)
                            }
                        });
                        state.buffer = []
                    } else {
                        for (var c = 0; c < state.buffer.length; c++) {
                            var entry = state.buffer[c];
                            var chunk = entry.chunk;
                            var encoding = entry.encoding;
                            var cb = entry.callback;
                            var len = state.objectMode ? 1 : chunk.length;
                            doWrite(stream, state, false, len, chunk, encoding, cb);
                            if (state.writing) {
                                c++;
                                break
                            }
                        }
                        if (c < state.buffer.length) state.buffer = state.buffer.slice(c);
                        else state.buffer.length = 0
                    }
                    state.bufferProcessing = false
                }
                Writable.prototype._write = function(chunk, encoding, cb) {
                    cb(new Error("not implemented"))
                };
                Writable.prototype._writev = null;
                Writable.prototype.end = function(chunk, encoding, cb) {
                    var state = this._writableState;
                    if (util.isFunction(chunk)) {
                        cb = chunk;
                        chunk = null;
                        encoding = null
                    } else if (util.isFunction(encoding)) {
                        cb = encoding;
                        encoding = null
                    }
                    if (!util.isNullOrUndefined(chunk)) this.write(chunk, encoding);
                    if (state.corked) {
                        state.corked = 1;
                        this.uncork()
                    }
                    if (!state.ending && !state.finished) endWritable(this, state, cb)
                };

                function needFinish(stream, state) {
                    return state.ending && state.length === 0 && !state.finished && !state.writing
                }

                function prefinish(stream, state) {
                    if (!state.prefinished) {
                        state.prefinished = true;
                        stream.emit("prefinish")
                    }
                }

                function finishMaybe(stream, state) {
                    var need = needFinish(stream, state);
                    if (need) {
                        if (state.pendingcb === 0) {
                            prefinish(stream, state);
                            state.finished = true;
                            stream.emit("finish")
                        } else prefinish(stream, state)
                    }
                    return need
                }

                function endWritable(stream, state, cb) {
                    state.ending = true;
                    finishMaybe(stream, state);
                    if (cb) {
                        if (state.finished) process.nextTick(cb);
                        else stream.once("finish", cb)
                    }
                    state.ended = true
                }
            }).call(this, require("_process"))
        }, {
            "./_stream_duplex": 16,
            _process: 10,
            buffer: 3,
            "core-util-is": 21,
            inherits: 8,
            stream: 26
        }],
        21: [function(require, module, exports) {
            (function(Buffer) {
                function isArray(ar) {
                    return Array.isArray(ar)
                }
                exports.isArray = isArray;

                function isBoolean(arg) {
                    return typeof arg === "boolean"
                }
                exports.isBoolean = isBoolean;

                function isNull(arg) {
                    return arg === null
                }
                exports.isNull = isNull;

                function isNullOrUndefined(arg) {
                    return arg == null
                }
                exports.isNullOrUndefined = isNullOrUndefined;

                function isNumber(arg) {
                    return typeof arg === "number"
                }
                exports.isNumber = isNumber;

                function isString(arg) {
                    return typeof arg === "string"
                }
                exports.isString = isString;

                function isSymbol(arg) {
                    return typeof arg === "symbol"
                }
                exports.isSymbol = isSymbol;

                function isUndefined(arg) {
                    return arg === void 0
                }
                exports.isUndefined = isUndefined;

                function isRegExp(re) {
                    return isObject(re) && objectToString(re) === "[object RegExp]"
                }
                exports.isRegExp = isRegExp;

                function isObject(arg) {
                    return typeof arg === "object" && arg !== null
                }
                exports.isObject = isObject;

                function isDate(d) {
                    return isObject(d) && objectToString(d) === "[object Date]"
                }
                exports.isDate = isDate;

                function isError(e) {
                    return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error)
                }
                exports.isError = isError;

                function isFunction(arg) {
                    return typeof arg === "function"
                }
                exports.isFunction = isFunction;

                function isPrimitive(arg) {
                    return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined"
                }
                exports.isPrimitive = isPrimitive;

                function isBuffer(arg) {
                    return Buffer.isBuffer(arg)
                }
                exports.isBuffer = isBuffer;

                function objectToString(o) {
                    return Object.prototype.toString.call(o)
                }
            }).call(this, require("buffer").Buffer)
        }, {
            buffer: 3
        }],
        22: [function(require, module, exports) {
            module.exports = require("./lib/_stream_passthrough.js")
        }, {
            "./lib/_stream_passthrough.js": 17
        }],
        23: [function(require, module, exports) {
            exports = module.exports = require("./lib/_stream_readable.js");
            exports.Stream = require("stream");
            exports.Readable = exports;
            exports.Writable = require("./lib/_stream_writable.js");
            exports.Duplex = require("./lib/_stream_duplex.js");
            exports.Transform = require("./lib/_stream_transform.js");
            exports.PassThrough = require("./lib/_stream_passthrough.js")
        }, {
            "./lib/_stream_duplex.js": 16,
            "./lib/_stream_passthrough.js": 17,
            "./lib/_stream_readable.js": 18,
            "./lib/_stream_transform.js": 19,
            "./lib/_stream_writable.js": 20,
            stream: 26
        }],
        24: [function(require, module, exports) {
            module.exports = require("./lib/_stream_transform.js")
        }, {
            "./lib/_stream_transform.js": 19
        }],
        25: [function(require, module, exports) {
            module.exports = require("./lib/_stream_writable.js")
        }, {
            "./lib/_stream_writable.js": 20
        }],
        26: [function(require, module, exports) {
            module.exports = Stream;
            var EE = require("events").EventEmitter;
            var inherits = require("inherits");
            inherits(Stream, EE);
            Stream.Readable = require("readable-stream/readable.js");
            Stream.Writable = require("readable-stream/writable.js");
            Stream.Duplex = require("readable-stream/duplex.js");
            Stream.Transform = require("readable-stream/transform.js");
            Stream.PassThrough = require("readable-stream/passthrough.js");
            Stream.Stream = Stream;

            function Stream() {
                EE.call(this)
            }
            Stream.prototype.pipe = function(dest, options) {
                var source = this;

                function ondata(chunk) {
                    if (dest.writable) {
                        if (false === dest.write(chunk) && source.pause) {
                            source.pause()
                        }
                    }
                }
                source.on("data", ondata);

                function ondrain() {
                    if (source.readable && source.resume) {
                        source.resume()
                    }
                }
                dest.on("drain", ondrain);
                if (!dest._isStdio && (!options || options.end !== false)) {
                    source.on("end", onend);
                    source.on("close", onclose)
                }
                var didOnEnd = false;

                function onend() {
                    if (didOnEnd) return;
                    didOnEnd = true;
                    dest.end()
                }

                function onclose() {
                    if (didOnEnd) return;
                    didOnEnd = true;
                    if (typeof dest.destroy === "function") dest.destroy()
                }

                function onerror(er) {
                    cleanup();
                    if (EE.listenerCount(this, "error") === 0) {
                        throw er
                    }
                }
                source.on("error", onerror);
                dest.on("error", onerror);

                function cleanup() {
                    source.removeListener("data", ondata);
                    dest.removeListener("drain", ondrain);
                    source.removeListener("end", onend);
                    source.removeListener("close", onclose);
                    source.removeListener("error", onerror);
                    dest.removeListener("error", onerror);
                    source.removeListener("end", cleanup);
                    source.removeListener("close", cleanup);
                    dest.removeListener("close", cleanup)
                }
                source.on("end", cleanup);
                source.on("close", cleanup);
                dest.on("close", cleanup);
                dest.emit("pipe", source);
                return dest
            }
        }, {
            events: 7,
            inherits: 8,
            "readable-stream/duplex.js": 15,
            "readable-stream/passthrough.js": 22,
            "readable-stream/readable.js": 23,
            "readable-stream/transform.js": 24,
            "readable-stream/writable.js": 25
        }],
        27: [function(require, module, exports) {
            var Buffer = require("buffer").Buffer;
            var isBufferEncoding = Buffer.isEncoding || function(encoding) {
                switch (encoding && encoding.toLowerCase()) {
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "binary":
                    case "base64":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                    case "raw":
                        return true;
                    default:
                        return false
                }
            };

            function assertEncoding(encoding) {
                if (encoding && !isBufferEncoding(encoding)) {
                    throw new Error("Unknown encoding: " + encoding)
                }
            }
            var StringDecoder = exports.StringDecoder = function(encoding) {
                this.encoding = (encoding || "utf8").toLowerCase().replace(/[-_]/, "");
                assertEncoding(encoding);
                switch (this.encoding) {
                    case "utf8":
                        this.surrogateSize = 3;
                        break;
                    case "ucs2":
                    case "utf16le":
                        this.surrogateSize = 2;
                        this.detectIncompleteChar = utf16DetectIncompleteChar;
                        break;
                    case "base64":
                        this.surrogateSize = 3;
                        this.detectIncompleteChar = base64DetectIncompleteChar;
                        break;
                    default:
                        this.write = passThroughWrite;
                        return
                }
                this.charBuffer = new Buffer(6);
                this.charReceived = 0;
                this.charLength = 0
            };
            StringDecoder.prototype.write = function(buffer) {
                var charStr = "";
                while (this.charLength) {
                    var available = buffer.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : buffer.length;
                    buffer.copy(this.charBuffer, this.charReceived, 0, available);
                    this.charReceived += available;
                    if (this.charReceived < this.charLength) {
                        return ""
                    }
                    buffer = buffer.slice(available, buffer.length);
                    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);
                    var charCode = charStr.charCodeAt(charStr.length - 1);
                    if (charCode >= 55296 && charCode <= 56319) {
                        this.charLength += this.surrogateSize;
                        charStr = "";
                        continue
                    }
                    this.charReceived = this.charLength = 0;
                    if (buffer.length === 0) {
                        return charStr
                    }
                    break
                }
                this.detectIncompleteChar(buffer);
                var end = buffer.length;
                if (this.charLength) {
                    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
                    end -= this.charReceived
                }
                charStr += buffer.toString(this.encoding, 0, end);
                var end = charStr.length - 1;
                var charCode = charStr.charCodeAt(end);
                if (charCode >= 55296 && charCode <= 56319) {
                    var size = this.surrogateSize;
                    this.charLength += size;
                    this.charReceived += size;
                    this.charBuffer.copy(this.charBuffer, size, 0, size);
                    buffer.copy(this.charBuffer, 0, 0, size);
                    return charStr.substring(0, end)
                }
                return charStr
            };
            StringDecoder.prototype.detectIncompleteChar = function(buffer) {
                var i = buffer.length >= 3 ? 3 : buffer.length;
                for (; i > 0; i--) {
                    var c = buffer[buffer.length - i];
                    if (i == 1 && c >> 5 == 6) {
                        this.charLength = 2;
                        break
                    }
                    if (i <= 2 && c >> 4 == 14) {
                        this.charLength = 3;
                        break
                    }
                    if (i <= 3 && c >> 3 == 30) {
                        this.charLength = 4;
                        break
                    }
                }
                this.charReceived = i
            };
            StringDecoder.prototype.end = function(buffer) {
                var res = "";
                if (buffer && buffer.length) res = this.write(buffer);
                if (this.charReceived) {
                    var cr = this.charReceived;
                    var buf = this.charBuffer;
                    var enc = this.encoding;
                    res += buf.slice(0, cr).toString(enc)
                }
                return res
            };

            function passThroughWrite(buffer) {
                return buffer.toString(this.encoding)
            }

            function utf16DetectIncompleteChar(buffer) {
                this.charReceived = buffer.length % 2;
                this.charLength = this.charReceived ? 2 : 0
            }

            function base64DetectIncompleteChar(buffer) {
                this.charReceived = buffer.length % 3;
                this.charLength = this.charReceived ? 3 : 0
            }
        }, {
            buffer: 3
        }],
        28: [function(require, module, exports) {
            var punycode = require("punycode");
            exports.parse = urlParse;
            exports.resolve = urlResolve;
            exports.resolveObject = urlResolveObject;
            exports.format = urlFormat;
            exports.Url = Url;

            function Url() {
                this.protocol = null;
                this.slashes = null;
                this.auth = null;
                this.host = null;
                this.port = null;
                this.hostname = null;
                this.hash = null;
                this.search = null;
                this.query = null;
                this.pathname = null;
                this.path = null;
                this.href = null
            }
            var protocolPattern = /^([a-z0-9.+-]+:)/i,
                portPattern = /:[0-9]*$/,
                delims = ["<", ">", '"', "`", " ", "\r", "\n", "	"],
                unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims),
                autoEscape = ["'"].concat(unwise),
                nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape),
                hostEndingChars = ["/", "?", "#"],
                hostnameMaxLen = 255,
                hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
                hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
                unsafeProtocol = {
                    javascript: true,
                    "javascript:": true
                },
                hostlessProtocol = {
                    javascript: true,
                    "javascript:": true
                },
                slashedProtocol = {
                    http: true,
                    https: true,
                    ftp: true,
                    gopher: true,
                    file: true,
                    "http:": true,
                    "https:": true,
                    "ftp:": true,
                    "gopher:": true,
                    "file:": true
                },
                querystring = require("querystring");

            function urlParse(url, parseQueryString, slashesDenoteHost) {
                if (url && isObject(url) && url instanceof Url) return url;
                var u = new Url;
                u.parse(url, parseQueryString, slashesDenoteHost);
                return u
            }
            Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
                if (!isString(url)) {
                    throw new TypeError("Parameter 'url' must be a string, not " + typeof url)
                }
                var rest = url;
                rest = rest.trim();
                var proto = protocolPattern.exec(rest);
                if (proto) {
                    proto = proto[0];
                    var lowerProto = proto.toLowerCase();
                    this.protocol = lowerProto;
                    rest = rest.substr(proto.length)
                }
                if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
                    var slashes = rest.substr(0, 2) === "//";
                    if (slashes && !(proto && hostlessProtocol[proto])) {
                        rest = rest.substr(2);
                        this.slashes = true
                    }
                }
                if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
                    var hostEnd = -1;
                    for (var i = 0; i < hostEndingChars.length; i++) {
                        var hec = rest.indexOf(hostEndingChars[i]);
                        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec
                    }
                    var auth, atSign;
                    if (hostEnd === -1) {
                        atSign = rest.lastIndexOf("@")
                    } else {
                        atSign = rest.lastIndexOf("@", hostEnd)
                    }
                    if (atSign !== -1) {
                        auth = rest.slice(0, atSign);
                        rest = rest.slice(atSign + 1);
                        this.auth = decodeURIComponent(auth)
                    }
                    hostEnd = -1;
                    for (var i = 0; i < nonHostChars.length; i++) {
                        var hec = rest.indexOf(nonHostChars[i]);
                        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec
                    }
                    if (hostEnd === -1) hostEnd = rest.length;
                    this.host = rest.slice(0, hostEnd);
                    rest = rest.slice(hostEnd);
                    this.parseHost();
                    this.hostname = this.hostname || "";
                    var ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
                    if (!ipv6Hostname) {
                        var hostparts = this.hostname.split(/\./);
                        for (var i = 0, l = hostparts.length; i < l; i++) {
                            var part = hostparts[i];
                            if (!part) continue;
                            if (!part.match(hostnamePartPattern)) {
                                var newpart = "";
                                for (var j = 0, k = part.length; j < k; j++) {
                                    if (part.charCodeAt(j) > 127) {
                                        newpart += "x"
                                    } else {
                                        newpart += part[j]
                                    }
                                }
                                if (!newpart.match(hostnamePartPattern)) {
                                    var validParts = hostparts.slice(0, i);
                                    var notHost = hostparts.slice(i + 1);
                                    var bit = part.match(hostnamePartStart);
                                    if (bit) {
                                        validParts.push(bit[1]);
                                        notHost.unshift(bit[2])
                                    }
                                    if (notHost.length) {
                                        rest = "/" + notHost.join(".") + rest
                                    }
                                    this.hostname = validParts.join(".");
                                    break
                                }
                            }
                        }
                    }
                    if (this.hostname.length > hostnameMaxLen) {
                        this.hostname = ""
                    } else {
                        this.hostname = this.hostname.toLowerCase()
                    }
                    if (!ipv6Hostname) {
                        var domainArray = this.hostname.split(".");
                        var newOut = [];
                        for (var i = 0; i < domainArray.length; ++i) {
                            var s = domainArray[i];
                            newOut.push(s.match(/[^A-Za-z0-9_-]/) ? "xn--" + punycode.encode(s) : s)
                        }
                        this.hostname = newOut.join(".")
                    }
                    var p = this.port ? ":" + this.port : "";
                    var h = this.hostname || "";
                    this.host = h + p;
                    this.href += this.host;
                    if (ipv6Hostname) {
                        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
                        if (rest[0] !== "/") {
                            rest = "/" + rest
                        }
                    }
                }
                if (!unsafeProtocol[lowerProto]) {
                    for (var i = 0, l = autoEscape.length; i < l; i++) {
                        var ae = autoEscape[i];
                        var esc = encodeURIComponent(ae);
                        if (esc === ae) {
                            esc = escape(ae)
                        }
                        rest = rest.split(ae).join(esc)
                    }
                }
                var hash = rest.indexOf("#");
                if (hash !== -1) {
                    this.hash = rest.substr(hash);
                    rest = rest.slice(0, hash)
                }
                var qm = rest.indexOf("?");
                if (qm !== -1) {
                    this.search = rest.substr(qm);
                    this.query = rest.substr(qm + 1);
                    if (parseQueryString) {
                        this.query = querystring.parse(this.query)
                    }
                    rest = rest.slice(0, qm)
                } else if (parseQueryString) {
                    this.search = "";
                    this.query = {}
                }
                if (rest) this.pathname = rest;
                if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
                    this.pathname = "/"
                }
                if (this.pathname || this.search) {
                    var p = this.pathname || "";
                    var s = this.search || "";
                    this.path = p + s
                }
                this.href = this.format();
                return this
            };

            function urlFormat(obj) {
                if (isString(obj)) obj = urlParse(obj);
                if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
                return obj.format()
            }
            Url.prototype.format = function() {
                var auth = this.auth || "";
                if (auth) {
                    auth = encodeURIComponent(auth);
                    auth = auth.replace(/%3A/i, ":");
                    auth += "@"
                }
                var protocol = this.protocol || "",
                    pathname = this.pathname || "",
                    hash = this.hash || "",
                    host = false,
                    query = "";
                if (this.host) {
                    host = auth + this.host
                } else if (this.hostname) {
                    host = auth + (this.hostname.indexOf(":") === -1 ? this.hostname : "[" + this.hostname + "]");
                    if (this.port) {
                        host += ":" + this.port
                    }
                }
                if (this.query && isObject(this.query) && Object.keys(this.query).length) {
                    query = querystring.stringify(this.query)
                }
                var search = this.search || query && "?" + query || "";
                if (protocol && protocol.substr(-1) !== ":") protocol += ":";
                if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
                    host = "//" + (host || "");
                    if (pathname && pathname.charAt(0) !== "/") pathname = "/" + pathname
                } else if (!host) {
                    host = ""
                }
                if (hash && hash.charAt(0) !== "#") hash = "#" + hash;
                if (search && search.charAt(0) !== "?") search = "?" + search;
                pathname = pathname.replace(/[?#]/g, function(match) {
                    return encodeURIComponent(match)
                });
                search = search.replace("#", "%23");
                return protocol + host + pathname + search + hash
            };

            function urlResolve(source, relative) {
                return urlParse(source, false, true).resolve(relative)
            }
            Url.prototype.resolve = function(relative) {
                return this.resolveObject(urlParse(relative, false, true)).format()
            };

            function urlResolveObject(source, relative) {
                if (!source) return relative;
                return urlParse(source, false, true).resolveObject(relative)
            }
            Url.prototype.resolveObject = function(relative) {
                if (isString(relative)) {
                    var rel = new Url;
                    rel.parse(relative, false, true);
                    relative = rel
                }
                var result = new Url;
                Object.keys(this).forEach(function(k) {
                    result[k] = this[k]
                }, this);
                result.hash = relative.hash;
                if (relative.href === "") {
                    result.href = result.format();
                    return result
                }
                if (relative.slashes && !relative.protocol) {
                    Object.keys(relative).forEach(function(k) {
                        if (k !== "protocol") result[k] = relative[k]
                    });
                    if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
                        result.path = result.pathname = "/"
                    }
                    result.href = result.format();
                    return result
                }
                if (relative.protocol && relative.protocol !== result.protocol) {
                    if (!slashedProtocol[relative.protocol]) {
                        Object.keys(relative).forEach(function(k) {
                            result[k] = relative[k]
                        });
                        result.href = result.format();
                        return result
                    }
                    result.protocol = relative.protocol;
                    if (!relative.host && !hostlessProtocol[relative.protocol]) {
                        var relPath = (relative.pathname || "").split("/");
                        while (relPath.length && !(relative.host = relPath.shift()));
                        if (!relative.host) relative.host = "";
                        if (!relative.hostname) relative.hostname = "";
                        if (relPath[0] !== "") relPath.unshift("");
                        if (relPath.length < 2) relPath.unshift("");
                        result.pathname = relPath.join("/")
                    } else {
                        result.pathname = relative.pathname
                    }
                    result.search = relative.search;
                    result.query = relative.query;
                    result.host = relative.host || "";
                    result.auth = relative.auth;
                    result.hostname = relative.hostname || relative.host;
                    result.port = relative.port;
                    if (result.pathname || result.search) {
                        var p = result.pathname || "";
                        var s = result.search || "";
                        result.path = p + s
                    }
                    result.slashes = result.slashes || relative.slashes;
                    result.href = result.format();
                    return result
                }
                var isSourceAbs = result.pathname && result.pathname.charAt(0) === "/",
                    isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === "/",
                    mustEndAbs = isRelAbs || isSourceAbs || result.host && relative.pathname,
                    removeAllDots = mustEndAbs,
                    srcPath = result.pathname && result.pathname.split("/") || [],
                    relPath = relative.pathname && relative.pathname.split("/") || [],
                    psychotic = result.protocol && !slashedProtocol[result.protocol];
                if (psychotic) {
                    result.hostname = "";
                    result.port = null;
                    if (result.host) {
                        if (srcPath[0] === "") srcPath[0] = result.host;
                        else srcPath.unshift(result.host)
                    }
                    result.host = "";
                    if (relative.protocol) {
                        relative.hostname = null;
                        relative.port = null;
                        if (relative.host) {
                            if (relPath[0] === "") relPath[0] = relative.host;
                            else relPath.unshift(relative.host)
                        }
                        relative.host = null
                    }
                    mustEndAbs = mustEndAbs && (relPath[0] === "" || srcPath[0] === "")
                }
                if (isRelAbs) {
                    result.host = relative.host || relative.host === "" ? relative.host : result.host;
                    result.hostname = relative.hostname || relative.hostname === "" ? relative.hostname : result.hostname;
                    result.search = relative.search;
                    result.query = relative.query;
                    srcPath = relPath
                } else if (relPath.length) {
                    if (!srcPath) srcPath = [];
                    srcPath.pop();
                    srcPath = srcPath.concat(relPath);
                    result.search = relative.search;
                    result.query = relative.query
                } else if (!isNullOrUndefined(relative.search)) {
                    if (psychotic) {
                        result.hostname = result.host = srcPath.shift();
                        var authInHost = result.host && result.host.indexOf("@") > 0 ? result.host.split("@") : false;
                        if (authInHost) {
                            result.auth = authInHost.shift();
                            result.host = result.hostname = authInHost.shift()
                        }
                    }
                    result.search = relative.search;
                    result.query = relative.query;
                    if (!isNull(result.pathname) || !isNull(result.search)) {
                        result.path = (result.pathname ? result.pathname : "") + (result.search ? result.search : "")
                    }
                    result.href = result.format();
                    return result
                }
                if (!srcPath.length) {
                    result.pathname = null;
                    if (result.search) {
                        result.path = "/" + result.search
                    } else {
                        result.path = null
                    }
                    result.href = result.format();
                    return result
                }
                var last = srcPath.slice(-1)[0];
                var hasTrailingSlash = (result.host || relative.host) && (last === "." || last === "..") || last === "";
                var up = 0;
                for (var i = srcPath.length; i >= 0; i--) {
                    last = srcPath[i];
                    if (last == ".") {
                        srcPath.splice(i, 1)
                    } else if (last === "..") {
                        srcPath.splice(i, 1);
                        up++
                    } else if (up) {
                        srcPath.splice(i, 1);
                        up--
                    }
                }
                if (!mustEndAbs && !removeAllDots) {
                    for (; up--; up) {
                        srcPath.unshift("..")
                    }
                }
                if (mustEndAbs && srcPath[0] !== "" && (!srcPath[0] || srcPath[0].charAt(0) !== "/")) {
                    srcPath.unshift("")
                }
                if (hasTrailingSlash && srcPath.join("/").substr(-1) !== "/") {
                    srcPath.push("")
                }
                var isAbsolute = srcPath[0] === "" || srcPath[0] && srcPath[0].charAt(0) === "/";
                if (psychotic) {
                    result.hostname = result.host = isAbsolute ? "" : srcPath.length ? srcPath.shift() : "";
                    var authInHost = result.host && result.host.indexOf("@") > 0 ? result.host.split("@") : false;
                    if (authInHost) {
                        result.auth = authInHost.shift();
                        result.host = result.hostname = authInHost.shift()
                    }
                }
                mustEndAbs = mustEndAbs || result.host && srcPath.length;
                if (mustEndAbs && !isAbsolute) {
                    srcPath.unshift("")
                }
                if (!srcPath.length) {
                    result.pathname = null;
                    result.path = null
                } else {
                    result.pathname = srcPath.join("/")
                }
                if (!isNull(result.pathname) || !isNull(result.search)) {
                    result.path = (result.pathname ? result.pathname : "") + (result.search ? result.search : "")
                }
                result.auth = relative.auth || result.auth;
                result.slashes = result.slashes || relative.slashes;
                result.href = result.format();
                return result
            };
            Url.prototype.parseHost = function() {
                var host = this.host;
                var port = portPattern.exec(host);
                if (port) {
                    port = port[0];
                    if (port !== ":") {
                        this.port = port.substr(1)
                    }
                    host = host.substr(0, host.length - port.length)
                }
                if (host) this.hostname = host
            };

            function isString(arg) {
                return typeof arg === "string"
            }

            function isObject(arg) {
                return typeof arg === "object" && arg !== null
            }

            function isNull(arg) {
                return arg === null
            }

            function isNullOrUndefined(arg) {
                return arg == null
            }
        }, {
            punycode: 11,
            querystring: 14
        }],
        29: [function(require, module, exports) {
            module.exports = function isBuffer(arg) {
                return arg && typeof arg === "object" && typeof arg.copy === "function" && typeof arg.fill === "function" && typeof arg.readUInt8 === "function"
            }
        }, {}],
        30: [function(require, module, exports) {
            (function(process, global) {
                var formatRegExp = /%[sdj%]/g;
                exports.format = function(f) {
                    if (!isString(f)) {
                        var objects = [];
                        for (var i = 0; i < arguments.length; i++) {
                            objects.push(inspect(arguments[i]))
                        }
                        return objects.join(" ")
                    }
                    var i = 1;
                    var args = arguments;
                    var len = args.length;
                    var str = String(f).replace(formatRegExp, function(x) {
                        if (x === "%%") return "%";
                        if (i >= len) return x;
                        switch (x) {
                            case "%s":
                                return String(args[i++]);
                            case "%d":
                                return Number(args[i++]);
                            case "%j":
                                try {
                                    return JSON.stringify(args[i++])
                                } catch (_) {
                                    return "[Circular]"
                                }
                            default:
                                return x
                        }
                    });
                    for (var x = args[i]; i < len; x = args[++i]) {
                        if (isNull(x) || !isObject(x)) {
                            str += " " + x
                        } else {
                            str += " " + inspect(x)
                        }
                    }
                    return str
                };
                exports.deprecate = function(fn, msg) {
                    if (isUndefined(global.process)) {
                        return function() {
                            return exports.deprecate(fn, msg).apply(this, arguments)
                        }
                    }
                    if (process.noDeprecation === true) {
                        return fn
                    }
                    var warned = false;

                    function deprecated() {
                        if (!warned) {
                            if (process.throwDeprecation) {
                                throw new Error(msg)
                            } else if (process.traceDeprecation) {
                                console.trace(msg)
                            } else {
                                console.error(msg)
                            }
                            warned = true
                        }
                        return fn.apply(this, arguments)
                    }
                    return deprecated
                };
                var debugs = {};
                var debugEnviron;
                exports.debuglog = function(set) {
                    if (isUndefined(debugEnviron)) debugEnviron = process.env.NODE_DEBUG || "";
                    set = set.toUpperCase();
                    if (!debugs[set]) {
                        if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
                            var pid = process.pid;
                            debugs[set] = function() {
                                var msg = exports.format.apply(exports, arguments);
                                console.error("%s %d: %s", set, pid, msg)
                            }
                        } else {
                            debugs[set] = function() {}
                        }
                    }
                    return debugs[set]
                };

                function inspect(obj, opts) {
                    var ctx = {
                        seen: [],
                        stylize: stylizeNoColor
                    };
                    if (arguments.length >= 3) ctx.depth = arguments[2];
                    if (arguments.length >= 4) ctx.colors = arguments[3];
                    if (isBoolean(opts)) {
                        ctx.showHidden = opts
                    } else if (opts) {
                        exports._extend(ctx, opts)
                    }
                    if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
                    if (isUndefined(ctx.depth)) ctx.depth = 2;
                    if (isUndefined(ctx.colors)) ctx.colors = false;
                    if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
                    if (ctx.colors) ctx.stylize = stylizeWithColor;
                    return formatValue(ctx, obj, ctx.depth)
                }
                exports.inspect = inspect;
                inspect.colors = {
                    bold: [1, 22],
                    italic: [3, 23],
                    underline: [4, 24],
                    inverse: [7, 27],
                    white: [37, 39],
                    grey: [90, 39],
                    black: [30, 39],
                    blue: [34, 39],
                    cyan: [36, 39],
                    green: [32, 39],
                    magenta: [35, 39],
                    red: [31, 39],
                    yellow: [33, 39]
                };
                inspect.styles = {
                    special: "cyan",
                    number: "yellow",
                    boolean: "yellow",
                    undefined: "grey",
                    null: "bold",
                    string: "green",
                    date: "magenta",
                    regexp: "red"
                };

                function stylizeWithColor(str, styleType) {
                    var style = inspect.styles[styleType];
                    if (style) {
                        return "[" + inspect.colors[style][0] + "m" + str + "[" + inspect.colors[style][1] + "m"
                    } else {
                        return str
                    }
                }

                function stylizeNoColor(str, styleType) {
                    return str
                }

                function arrayToHash(array) {
                    var hash = {};
                    array.forEach(function(val, idx) {
                        hash[val] = true
                    });
                    return hash
                }

                function formatValue(ctx, value, recurseTimes) {
                    if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== exports.inspect && !(value.constructor && value.constructor.prototype === value)) {
                        var ret = value.inspect(recurseTimes, ctx);
                        if (!isString(ret)) {
                            ret = formatValue(ctx, ret, recurseTimes)
                        }
                        return ret
                    }
                    var primitive = formatPrimitive(ctx, value);
                    if (primitive) {
                        return primitive
                    }
                    var keys = Object.keys(value);
                    var visibleKeys = arrayToHash(keys);
                    if (ctx.showHidden) {
                        keys = Object.getOwnPropertyNames(value)
                    }
                    if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
                        return formatError(value)
                    }
                    if (keys.length === 0) {
                        if (isFunction(value)) {
                            var name = value.name ? ": " + value.name : "";
                            return ctx.stylize("[Function" + name + "]", "special")
                        }
                        if (isRegExp(value)) {
                            return ctx.stylize(RegExp.prototype.toString.call(value), "regexp")
                        }
                        if (isDate(value)) {
                            return ctx.stylize(Date.prototype.toString.call(value), "date")
                        }
                        if (isError(value)) {
                            return formatError(value)
                        }
                    }
                    var base = "",
                        array = false,
                        braces = ["{", "}"];
                    if (isArray(value)) {
                        array = true;
                        braces = ["[", "]"]
                    }
                    if (isFunction(value)) {
                        var n = value.name ? ": " + value.name : "";
                        base = " [Function" + n + "]"
                    }
                    if (isRegExp(value)) {
                        base = " " + RegExp.prototype.toString.call(value)
                    }
                    if (isDate(value)) {
                        base = " " + Date.prototype.toUTCString.call(value)
                    }
                    if (isError(value)) {
                        base = " " + formatError(value)
                    }
                    if (keys.length === 0 && (!array || value.length == 0)) {
                        return braces[0] + base + braces[1]
                    }
                    if (recurseTimes < 0) {
                        if (isRegExp(value)) {
                            return ctx.stylize(RegExp.prototype.toString.call(value), "regexp")
                        } else {
                            return ctx.stylize("[Object]", "special")
                        }
                    }
                    ctx.seen.push(value);
                    var output;
                    if (array) {
                        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys)
                    } else {
                        output = keys.map(function(key) {
                            return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array)
                        })
                    }
                    ctx.seen.pop();
                    return reduceToSingleString(output, base, braces)
                }

                function formatPrimitive(ctx, value) {
                    if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
                    if (isString(value)) {
                        var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                        return ctx.stylize(simple, "string")
                    }
                    if (isNumber(value)) return ctx.stylize("" + value, "number");
                    if (isBoolean(value)) return ctx.stylize("" + value, "boolean");
                    if (isNull(value)) return ctx.stylize("null", "null")
                }

                function formatError(value) {
                    return "[" + Error.prototype.toString.call(value) + "]"
                }

                function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                    var output = [];
                    for (var i = 0, l = value.length; i < l; ++i) {
                        if (hasOwnProperty(value, String(i))) {
                            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true))
                        } else {
                            output.push("")
                        }
                    }
                    keys.forEach(function(key) {
                        if (!key.match(/^\d+$/)) {
                            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true))
                        }
                    });
                    return output
                }

                function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                    var name, str, desc;
                    desc = Object.getOwnPropertyDescriptor(value, key) || {
                        value: value[key]
                    };
                    if (desc.get) {
                        if (desc.set) {
                            str = ctx.stylize("[Getter/Setter]", "special")
                        } else {
                            str = ctx.stylize("[Getter]", "special")
                        }
                    } else {
                        if (desc.set) {
                            str = ctx.stylize("[Setter]", "special")
                        }
                    }
                    if (!hasOwnProperty(visibleKeys, key)) {
                        name = "[" + key + "]"
                    }
                    if (!str) {
                        if (ctx.seen.indexOf(desc.value) < 0) {
                            if (isNull(recurseTimes)) {
                                str = formatValue(ctx, desc.value, null)
                            } else {
                                str = formatValue(ctx, desc.value, recurseTimes - 1)
                            }
                            if (str.indexOf("\n") > -1) {
                                if (array) {
                                    str = str.split("\n").map(function(line) {
                                        return "  " + line
                                    }).join("\n").substr(2)
                                } else {
                                    str = "\n" + str.split("\n").map(function(line) {
                                        return "   " + line
                                    }).join("\n")
                                }
                            }
                        } else {
                            str = ctx.stylize("[Circular]", "special")
                        }
                    }
                    if (isUndefined(name)) {
                        if (array && key.match(/^\d+$/)) {
                            return str
                        }
                        name = JSON.stringify("" + key);
                        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                            name = name.substr(1, name.length - 2);
                            name = ctx.stylize(name, "name")
                        } else {
                            name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
                            name = ctx.stylize(name, "string")
                        }
                    }
                    return name + ": " + str
                }

                function reduceToSingleString(output, base, braces) {
                    var numLinesEst = 0;
                    var length = output.reduce(function(prev, cur) {
                        numLinesEst++;
                        if (cur.indexOf("\n") >= 0) numLinesEst++;
                        return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1
                    }, 0);
                    if (length > 60) {
                        return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1]
                    }
                    return braces[0] + base + " " + output.join(", ") + " " + braces[1]
                }

                function isArray(ar) {
                    return Array.isArray(ar)
                }
                exports.isArray = isArray;

                function isBoolean(arg) {
                    return typeof arg === "boolean"
                }
                exports.isBoolean = isBoolean;

                function isNull(arg) {
                    return arg === null
                }
                exports.isNull = isNull;

                function isNullOrUndefined(arg) {
                    return arg == null
                }
                exports.isNullOrUndefined = isNullOrUndefined;

                function isNumber(arg) {
                    return typeof arg === "number"
                }
                exports.isNumber = isNumber;

                function isString(arg) {
                    return typeof arg === "string"
                }
                exports.isString = isString;

                function isSymbol(arg) {
                    return typeof arg === "symbol"
                }
                exports.isSymbol = isSymbol;

                function isUndefined(arg) {
                    return arg === void 0
                }
                exports.isUndefined = isUndefined;

                function isRegExp(re) {
                    return isObject(re) && objectToString(re) === "[object RegExp]"
                }
                exports.isRegExp = isRegExp;

                function isObject(arg) {
                    return typeof arg === "object" && arg !== null
                }
                exports.isObject = isObject;

                function isDate(d) {
                    return isObject(d) && objectToString(d) === "[object Date]"
                }
                exports.isDate = isDate;

                function isError(e) {
                    return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error)
                }
                exports.isError = isError;

                function isFunction(arg) {
                    return typeof arg === "function";
                }
                exports.isFunction = isFunction;

                function isPrimitive(arg) {
                    return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined"
                }
                exports.isPrimitive = isPrimitive;
                exports.isBuffer = require("./support/isBuffer");

                function objectToString(o) {
                    return Object.prototype.toString.call(o)
                }

                function pad(n) {
                    return n < 10 ? "0" + n.toString(10) : n.toString(10)
                }
                var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                function timestamp() {
                    var d = new Date;
                    var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");
                    return [d.getDate(), months[d.getMonth()], time].join(" ")
                }
                exports.log = function() {
                    console.log("%s - %s", timestamp(), exports.format.apply(exports, arguments))
                };
                exports.inherits = require("inherits");
                exports._extend = function(origin, add) {
                    if (!add || !isObject(add)) return origin;
                    var keys = Object.keys(add);
                    var i = keys.length;
                    while (i--) {
                        origin[keys[i]] = add[keys[i]]
                    }
                    return origin
                };

                function hasOwnProperty(obj, prop) {
                    return Object.prototype.hasOwnProperty.call(obj, prop)
                }
            }).call(this, require("_process"), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {
            "./support/isBuffer": 29,
            _process: 10,
            inherits: 8
        }],
        31: [function(require, module, exports) {
            (function(process, global) {
                "use strict";
                var events = require("events"),
                    Store = require("./store"),
                    eos = require("end-of-stream"),
                    mqttPacket = require("mqtt-packet"),
                    Writable = require("readable-stream").Writable,
                    inherits = require("inherits"),
                    setImmediate = global.setImmediate || function(callback) {
                        process.nextTick(callback)
                    },
                    defaultConnectOptions = {
                        keepalive: 10,
                        protocolId: "MQTT",
                        protocolVersion: 4,
                        reconnectPeriod: 1e3,
                        connectTimeout: 30 * 1e3,
                        clean: true
                    };

                function defaultId() {
                    return "mqttjs_" + Math.random().toString(16).substr(2, 8)
                }

                function sendPacket(client, packet, cb) {
                    try {
                        var buf = mqttPacket.generate(packet);
                        if (!client.stream.write(buf) && cb) {
                            client.stream.once("drain", cb)
                        } else if (cb) {
                            cb()
                        }
                    } catch (err) {
                        if (cb) {
                            cb(err)
                        } else {
                            client.emit("error", err)
                        }
                    }
                }

                function storeAndSend(client, packet, cb) {
                    client.outgoingStore.put(packet, function storedPacket(err) {
                        if (err) {
                            return cb && cb(err)
                        }
                        sendPacket(client, packet, cb)
                    })
                }

                function nop() {}

                function MqttClient(streamBuilder, options) {
                    var k, that = this;
                    if (!(this instanceof MqttClient)) {
                        return new MqttClient(streamBuilder, options)
                    }
                    this.options = options || {};
                    for (k in defaultConnectOptions) {
                        if ("undefined" === typeof this.options[k]) {
                            this.options[k] = defaultConnectOptions[k]
                        } else {
                            this.options[k] = options[k]
                        }
                    }
                    this.options.clientId = this.options.clientId || defaultId();
                    this.streamBuilder = streamBuilder;
                    this.outgoingStore = this.options.outgoingStore || new Store;
                    this.incomingStore = this.options.incomingStore || new Store;
                    this.pingTimer = null;
                    this.connected = false;
                    this.disconnecting = false;
                    this.queue = [];
                    this.disconnecting = false;
                    this.connackTimer = null;
                    this.reconnectTimer = null;
                    this.nextId = Math.floor(Math.random() * 65535);
                    this.outgoing = {};
                    this.on("connect", function() {
                        this.connected = true
                    });
                    this.on("close", function() {
                        this.connected = false
                    });
                    this.on("connect", this._setupPingTimer);
                    this.on("connect", function() {
                        var queue = this.queue;

                        function deliver() {
                            var entry = queue.shift(),
                                packet = null;
                            if (!entry) {
                                return
                            }
                            packet = entry.packet;
                            that._sendPacket(packet, function(err) {
                                if (entry.cb) {
                                    entry.cb(err)
                                }
                                deliver()
                            })
                        }
                        deliver()
                    });
                    this.on("close", function() {
                        if (null !== that.pingTimer) {
                            clearInterval(that.pingTimer);
                            that.pingTimer = null
                        }
                    });
                    this.on("close", this._setupReconnect);
                    events.EventEmitter.call(this);
                    this._setupStream()
                }
                inherits(MqttClient, events.EventEmitter);
                MqttClient.prototype._setupStream = function() {
                    var connectPacket, that = this,
                        writable = new Writable,
                        parser = mqttPacket.parser(this.options),
                        completeParse = null,
                        outStore = null,
                        packets = [];
                    this._clearReconnect();
                    this.stream = this.streamBuilder(this);
                    parser.on("packet", function(packet) {
                        packets.push(packet)
                    });

                    function process() {
                        var packet = packets.shift(),
                            done = completeParse;
                        if (packet) {
                            that._handlePacket(packet, process)
                        } else {
                            completeParse = null;
                            done()
                        }
                    }
                    writable._write = function(buf, enc, done) {
                        completeParse = done;
                        parser.parse(buf);
                        process()
                    };
                    this.stream.pipe(writable);
                    this.stream.on("error", nop);
                    eos(this.stream, this.emit.bind(this, "close"));
                    connectPacket = Object.create(this.options);
                    connectPacket.cmd = "connect";
                    sendPacket(this, connectPacket);
                    parser.on("error", this.emit.bind(this, "error"));
                    outStore = this.outgoingStore.createStream();
                    outStore.once("readable", function() {
                        function storeDeliver() {
                            var packet = outStore.read(1);
                            if (!packet) {
                                return
                            }
                            if (!that.disconnecting && !that.reconnectTimer && 0 < that.options.reconnectPeriod) {
                                outStore.read(0);
                                that.outgoing[packet.messageId] = function() {
                                    storeDeliver()
                                };
                                that._sendPacket(packet)
                            } else {
                                outStore.close()
                            }
                        }
                        storeDeliver()
                    }).on("error", this.emit.bind(this, "error"));
                    clearTimeout(this.connackTimer);
                    this.connackTimer = setTimeout(function() {
                        that._cleanUp(true)
                    }, this.options.connectTimeout)
                };
                MqttClient.prototype._handlePacket = function(packet, done) {
                    switch (packet.cmd) {
                        case "publish":
                            this._handlePublish(packet, done);
                            break;
                        case "puback":
                        case "pubrec":
                        case "pubcomp":
                        case "suback":
                        case "unsuback":
                            this._handleAck(packet);
                            done();
                            break;
                        case "pubrel":
                            this._handlePubrel(packet, done);
                            break;
                        case "connack":
                            this._handleConnack(packet);
                            done();
                            break;
                        case "pingresp":
                            this._handlePingresp(packet);
                            done();
                            break;
                        default:
                            break
                    }
                };
                MqttClient.prototype._checkDisconnecting = function(callback) {
                    if (this.disconnecting) {
                        if (callback) {
                            callback(new Error("client disconnecting"))
                        } else {
                            this.emit(new Error("client disconnecting"))
                        }
                    }
                    return this.disconnecting
                };
                MqttClient.prototype.publish = function(topic, message, opts, callback) {
                    var packet;
                    if ("function" === typeof opts) {
                        callback = opts;
                        opts = null
                    }
                    if (!opts) {
                        opts = {
                            qos: 0,
                            retain: false
                        }
                    }
                    if (this._checkDisconnecting(callback)) {
                        return this
                    }
                    callback = callback || nop;
                    packet = {
                        cmd: "publish",
                        topic: topic,
                        payload: message,
                        qos: opts.qos,
                        retain: opts.retain,
                        messageId: this._nextId()
                    };
                    switch (opts.qos) {
                        case 1:
                        case 2:
                            this.outgoing[packet.messageId] = callback;
                            this._sendPacket(packet);
                            break;
                        default:
                            this._sendPacket(packet, callback);
                            break
                    }
                    return this
                };
                MqttClient.prototype.subscribe = function() {
                    var packet, args = Array.prototype.slice.call(arguments),
                        subs = [],
                        obj = args.shift(),
                        callback = args.pop() || nop,
                        opts = args.pop();
                    if ("string" === typeof obj) {
                        obj = [obj]
                    }
                    if (this._checkDisconnecting(callback)) {
                        return this
                    }
                    if ("function" !== typeof callback) {
                        opts = callback;
                        callback = nop
                    }
                    if (!opts) {
                        opts = {
                            qos: 0
                        }
                    }
                    if (Array.isArray(obj)) {
                        obj.forEach(function(topic) {
                            subs.push({
                                topic: topic,
                                qos: opts.qos
                            })
                        })
                    } else {
                        Object.keys(obj).forEach(function(k) {
                            subs.push({
                                topic: k,
                                qos: obj[k]
                            })
                        })
                    }
                    packet = {
                        cmd: "subscribe",
                        subscriptions: subs,
                        qos: 1,
                        retain: false,
                        dup: false,
                        messageId: this._nextId()
                    };
                    this.outgoing[packet.messageId] = callback;
                    this._sendPacket(packet);
                    return this
                };
                MqttClient.prototype.unsubscribe = function(topic, callback) {
                    var packet = {
                        cmd: "unsubscribe",
                        qos: 1,
                        messageId: this._nextId()
                    };
                    callback = callback || nop;
                    if (this._checkDisconnecting(callback)) {
                        return this
                    }
                    if ("string" === typeof topic) {
                        packet.unsubscriptions = [topic]
                    } else if ("object" === typeof topic && topic.length) {
                        packet.unsubscriptions = topic
                    }
                    this.outgoing[packet.messageId] = callback;
                    this._sendPacket(packet);
                    return this
                };
                MqttClient.prototype.end = function(force, cb) {
                    var that = this;
                    if ("function" === typeof force) {
                        cb = force;
                        force = false
                    }

                    function closeStores() {
                        that.incomingStore.close(function() {
                            that.outgoingStore.close(cb)
                        })
                    }

                    function finish() {
                        that._cleanUp(force, closeStores)
                    }
                    if (this.disconnecting) {
                        return true
                    }
                    this.disconnecting = true;
                    if (!force && 0 < Object.keys(this.outgoing).length) {
                        this.once("outgoingEmpty", setTimeout.bind(null, finish, 10))
                    } else {
                        finish()
                    }
                    return this
                };
                MqttClient.prototype._reconnect = function() {
                    this.emit("reconnect");
                    this._setupStream()
                };
                MqttClient.prototype._setupReconnect = function() {
                    var that = this;
                    if (!that.disconnecting && !that.reconnectTimer && 0 < that.options.reconnectPeriod) {
                        this.emit("offline");
                        that.reconnectTimer = setInterval(function() {
                            that._reconnect()
                        }, that.options.reconnectPeriod)
                    }
                };
                MqttClient.prototype._clearReconnect = function() {
                    if (this.reconnectTimer) {
                        clearInterval(this.reconnectTimer);
                        this.reconnectTimer = false
                    }
                };
                MqttClient.prototype._cleanUp = function(forced, done) {
                    if (done) {
                        this.stream.on("close", done)
                    }
                    if (forced) {
                        this.stream.destroy()
                    } else {
                        this._sendPacket({
                            cmd: "disconnect"
                        }, setImmediate.bind(null, this.stream.end.bind(this.stream)))
                    }
                    this._clearReconnect();
                    if (null !== this.pingTimer) {
                        clearInterval(this.pingTimer);
                        this.pingTimer = null
                    }
                };
                MqttClient.prototype._sendPacket = function(packet, cb) {
                    if (!this.connected) {
                        return this.queue.push({
                            packet: packet,
                            cb: cb
                        })
                    }
                    switch (packet.qos) {
                        case 2:
                        case 1:
                            storeAndSend(this, packet, cb);
                            break;
                        case 0:
                        default:
                            sendPacket(this, packet, cb);
                            break
                    }
                };
                MqttClient.prototype._setupPingTimer = function() {
                    var that = this;
                    if (!this.pingTimer && this.options.keepalive) {
                        this.pingResp = true;
                        this.pingTimer = setInterval(function() {
                            that._checkPing()
                        }, this.options.keepalive * 1e3)
                    }
                };
                MqttClient.prototype._checkPing = function() {
                    if (this.pingResp) {
                        this.pingResp = false;
                        this._sendPacket({
                            cmd: "pingreq"
                        })
                    } else {
                        this._cleanUp(true)
                    }
                };
                MqttClient.prototype._handlePingresp = function() {
                    this.pingResp = true
                };
                MqttClient.prototype._handleConnack = function(packet) {
                    var rc = packet.returnCode,
                        errors = ["", "Unacceptable protocol version", "Identifier rejected", "Server unavailable", "Bad username or password", "Not authorized"];
                    clearTimeout(this.connackTimer);
                    if (0 === rc) {
                        this.emit("connect")
                    } else if (0 < rc) {
                        this.emit("error", new Error("Connection refused: " + errors[rc]))
                    }
                };
                MqttClient.prototype._handlePublish = function(packet, done) {
                    var topic = packet.topic.toString(),
                        message = packet.payload,
                        qos = packet.qos,
                        mid = packet.messageId,
                        that = this;
                    switch (qos) {
                        case 2:
                            this.incomingStore.put(packet, function() {
                                that._sendPacket({
                                    cmd: "pubrec",
                                    messageId: mid
                                }, done)
                            });
                            break;
                        case 1:
                            this._sendPacket({
                                cmd: "puback",
                                messageId: mid
                            });
                        case 0:
                            this.emit("message", topic, message, packet);
                            this.handleMessage(packet, done);
                            break;
                        default:
                            break
                    }
                };
                MqttClient.prototype.handleMessage = function(packet, callback) {
                    callback()
                };
                MqttClient.prototype._handleAck = function(packet) {
                    var mid = packet.messageId,
                        type = packet.cmd,
                        response = null,
                        cb = this.outgoing[mid],
                        that = this;
                    if (!cb) {
                        return
                    }
                    switch (type) {
                        case "pubcomp":
                        case "puback":
                            delete this.outgoing[mid];
                            this.outgoingStore.del(packet, cb);
                            break;
                        case "pubrec":
                            response = {
                                cmd: "pubrel",
                                qos: 2,
                                messageId: mid
                            };
                            this._sendPacket(response);
                            break;
                        case "suback":
                            delete this.outgoing[mid];
                            this.outgoingStore.del(packet, function(err, original) {
                                var i, origSubs = original.subscriptions,
                                    granted = packet.granted;
                                if (err) {
                                    return that.emit("error", err)
                                }
                                for (i = 0; i < granted.length; i += 1) {
                                    origSubs[i].qos = granted[i]
                                }
                                cb(null, origSubs)
                            });
                            break;
                        case "unsuback":
                            delete this.outgoing[mid];
                            this.outgoingStore.del(packet, cb);
                            break;
                        default:
                            that.emit("error", new Error("unrecognized packet type"))
                    }
                    if (this.disconnecting && 0 === Object.keys(this.outgoing).length) {
                        this.emit("outgoingEmpty")
                    }
                };
                MqttClient.prototype._handlePubrel = function(packet, callback) {
                    var mid = packet.messageId,
                        that = this;
                    that.incomingStore.get(packet, function(err, pub) {
                        if (err) {
                            return that.emit("error", err)
                        }
                        if ("pubrel" !== pub.cmd) {
                            that.emit("message", pub.topic, pub.payload, pub);
                            that.incomingStore.put(packet)
                        }
                        that._sendPacket({
                            cmd: "pubcomp",
                            messageId: mid
                        }, callback)
                    })
                };
                MqttClient.prototype._nextId = function() {
                    var id = this.nextId++;
                    if (65535 === id) {
                        this.nextId = 1
                    }
                    return id
                };
                module.exports = MqttClient
            }).call(this, require("_process"), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {
            "./store": 35,
            _process: 10,
            "end-of-stream": 36,
            events: 7,
            inherits: 39,
            "mqtt-packet": 42,
            "readable-stream": 55
        }],
        32: [function(require, module, exports) {
            "use strict";
            var net = require("net");

            function buildBuilder(client, opts) {
                var port, host;
                opts.port = opts.port || 1883;
                opts.hostname = opts.hostname || opts.host || "localhost";
                port = opts.port;
                host = opts.hostname;
                return net.createConnection(port, host)
            }
            module.exports = buildBuilder
        }, {
            net: 1
        }],
        33: [function(require, module, exports) {
            "use strict";
            var tls = require("tls");

            function buildBuilder(mqttClient, opts) {
                var connection;
                opts.port = opts.port || 8883;
                opts.host = opts.hostname || opts.host || "localhost";
                opts.rejectUnauthorized = !(false === opts.rejectUnauthorized);
                connection = tls.connect(opts);
                connection.on("secureConnect", function() {
                    if (opts.rejectUnauthorized && !connection.authorized) {
                        connection.emit("error", new Error("TLS not authorized"))
                    } else {
                        connection.removeListener("error", handleTLSerrors)
                    }
                });

                function handleTLSerrors(err) {
                    if (opts.rejectUnauthorized) {
                        mqttClient.emit("error", err)
                    }
                    connection.end()
                }
                connection.on("error", handleTLSerrors);
                return connection
            }
            module.exports = buildBuilder
        }, {
            tls: 1
        }],
        34: [function(require, module, exports) {
            (function(process) {
                "use strict";
                var websocket = require("websocket-stream"),
                    _URL = require("url");

                function buildBuilder(client, opts) {
                    var wsOpt = {
                            protocol: "mqttv3.1"
                        },
                        host = opts.hostname || "localhost",
                        port = String(opts.port || 80),
                        path = opts.path || "/",
                        url = opts.protocol + "://" + host + ":" + port + path;
                    if ("wss" === opts.protocol) {
                        if (opts.hasOwnProperty("rejectUnauthorized")) {
                            wsOpt.rejectUnauthorized = opts.rejectUnauthorized
                        }
                    }
                    return websocket(url, wsOpt)
                }

                function buildBuilderBrowser(mqttClient, opts) {
                    var url, parsed = _URL.parse(document.URL);
                    if (!opts.protocol) {
                        if ("https:" === parsed.protocol) {
                            opts.protocol = "wss"
                        } else {
                            opts.protocol = "ws"
                        }
                    }
                    if (!opts.hostname) {
                        opts.hostnme = opts.host
                    }
                    if (!opts.hostname) {
                        opts.hostname = parsed.hostname;
                        if (!opts.port) {
                            opts.port = parsed.port
                        }
                    }
                    if (!opts.port) {
                        if ("wss" === opts.protocol) {
                            opts.port = 443
                        } else {
                            opts.port = 80
                        }
                    }
                    if (!opts.path) {
                        opts.path = "/"
                    }
                    url = opts.protocol + "://" + opts.hostname + ":" + opts.port + opts.path;
                    return websocket(url, "mqttv3.1")
                }
                if ("browser" !== process.title) {
                    module.exports = buildBuilder
                } else {
                    module.exports = buildBuilderBrowser
                }
            }).call(this, require("_process"))
        }, {
            _process: 10,
            url: 28,
            "websocket-stream": 74
        }],
        35: [function(require, module, exports) {
            "use strict";
            var PassThrough = require("readable-stream").PassThrough,
                streamsOpts = {
                    objectMode: true
                };

            function Store() {
                if (!(this instanceof Store)) {
                    return new Store
                }
                this._inflights = {}
            }
            Store.prototype.put = function(packet, cb) {
                this._inflights[packet.messageId] = packet;
                if (cb) {
                    cb()
                }
                return this
            };
            Store.prototype.createStream = function() {
                var stream = new PassThrough(streamsOpts),
                    ids = Object.keys(this._inflights),
                    i = 0;
                for (i = 0; i < ids.length; i++) {
                    stream.write(this._inflights[ids[i]])
                }
                stream.end();
                return stream
            };
            Store.prototype.del = function(packet, cb) {
                packet = this._inflights[packet.messageId];
                if (packet) {
                    delete this._inflights[packet.messageId];
                    cb(null, packet)
                } else if (cb) {
                    cb(new Error("missing packet"))
                }
                return this
            };
            Store.prototype.get = function(packet, cb) {
                packet = this._inflights[packet.messageId];
                if (packet) {
                    cb(null, packet)
                } else if (cb) {
                    cb(new Error("missing packet"))
                }
                return this
            };
            Store.prototype.close = function(cb) {
                this._inflights = null;
                if (cb) {
                    cb()
                }
            };
            module.exports = Store
        }, {
            "readable-stream": 55
        }],
        36: [function(require, module, exports) {
            var once = require("once");
            var noop = function() {};
            var isRequest = function(stream) {
                return stream.setHeader && typeof stream.abort === "function"
            };
            var isChildProcess = function(stream) {
                return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
            };
            var eos = function(stream, opts, callback) {
                if (typeof opts === "function") return eos(stream, null, opts);
                if (!opts) opts = {};
                callback = once(callback || noop);
                var ws = stream._writableState;
                var rs = stream._readableState;
                var readable = opts.readable || opts.readable !== false && stream.readable;
                var writable = opts.writable || opts.writable !== false && stream.writable;
                var onlegacyfinish = function() {
                    if (!stream.writable) onfinish()
                };
                var onfinish = function() {
                    writable = false;
                    if (!readable) callback()
                };
                var onend = function() {
                    readable = false;
                    if (!writable) callback()
                };
                var onexit = function(exitCode) {
                    callback(exitCode ? new Error("exited with error code: " + exitCode) : null)
                };
                var onclose = function() {
                    if (readable && !(rs && rs.ended)) return callback(new Error("premature close"));
                    if (writable && !(ws && ws.ended)) return callback(new Error("premature close"))
                };
                var onrequest = function() {
                    stream.req.on("finish", onfinish)
                };
                if (isRequest(stream)) {
                    stream.on("complete", onfinish);
                    stream.on("abort", onclose);
                    if (stream.req) onrequest();
                    else stream.on("request", onrequest)
                } else if (writable && !ws) {
                    stream.on("end", onlegacyfinish);
                    stream.on("close", onlegacyfinish)
                }
                if (isChildProcess(stream)) stream.on("exit", onexit);
                stream.on("end", onend);
                stream.on("finish", onfinish);
                if (opts.error !== false) stream.on("error", callback);
                stream.on("close", onclose);
                return function() {
                    stream.removeListener("complete", onfinish);
                    stream.removeListener("abort", onclose);
                    stream.removeListener("request", onrequest);
                    if (stream.req) stream.req.removeListener("finish", onfinish);
                    stream.removeListener("end", onlegacyfinish);
                    stream.removeListener("close", onlegacyfinish);
                    stream.removeListener("finish", onfinish);
                    stream.removeListener("exit", onexit);
                    stream.removeListener("end", onend);
                    stream.removeListener("error", callback);
                    stream.removeListener("close", onclose)
                }
            };
            module.exports = eos
        }, {
            once: 38
        }],
        37: [function(require, module, exports) {
            module.exports = wrappy;

            function wrappy(fn, cb) {
                if (fn && cb) return wrappy(fn)(cb);
                if (typeof fn !== "function") throw new TypeError("need wrapper function");
                Object.keys(fn).forEach(function(k) {
                    wrapper[k] = fn[k]
                });
                return wrapper;

                function wrapper() {
                    var args = new Array(arguments.length);
                    for (var i = 0; i < args.length; i++) {
                        args[i] = arguments[i]
                    }
                    var ret = fn.apply(this, args);
                    var cb = args[args.length - 1];
                    if (typeof ret === "function" && ret !== cb) {
                        Object.keys(cb).forEach(function(k) {
                            ret[k] = cb[k]
                        })
                    }
                    return ret
                }
            }
        }, {}],
        38: [function(require, module, exports) {
            var wrappy = require("wrappy");
            module.exports = wrappy(once);
            once.proto = once(function() {
                Object.defineProperty(Function.prototype, "once", {
                    value: function() {
                        return once(this)
                    },
                    configurable: true
                })
            });

            function once(fn) {
                var f = function() {
                    if (f.called) return f.value;
                    f.called = true;
                    return f.value = fn.apply(this, arguments)
                };
                f.called = false;
                return f
            }
        }, {
            wrappy: 37
        }],
        39: [function(require, module, exports) {
            arguments[4][8][0].apply(exports, arguments)
        }, {
            dup: 8
        }],
        40: [function(require, module, exports) {
            module.exports.types = {
                0: "reserved",
                1: "connect",
                2: "connack",
                3: "publish",
                4: "puback",
                5: "pubrec",
                6: "pubrel",
                7: "pubcomp",
                8: "subscribe",
                9: "suback",
                10: "unsubscribe",
                11: "unsuback",
                12: "pingreq",
                13: "pingresp",
                14: "disconnect",
                15: "reserved"
            };
            module.exports.codes = {};
            for (var k in module.exports.types) {
                var v = module.exports.types[k];
                module.exports.codes[v] = k
            }
            module.exports.CMD_SHIFT = 4;
            module.exports.CMD_MASK = 240;
            module.exports.DUP_MASK = 8;
            module.exports.QOS_MASK = 3;
            module.exports.QOS_SHIFT = 1;
            module.exports.RETAIN_MASK = 1;
            module.exports.LENGTH_MASK = 127;
            module.exports.LENGTH_FIN_MASK = 128;
            module.exports.SESSIONPRESENT_MASK = 1;
            module.exports.USERNAME_MASK = 128;
            module.exports.PASSWORD_MASK = 64;
            module.exports.WILL_RETAIN_MASK = 32;
            module.exports.WILL_QOS_MASK = 24;
            module.exports.WILL_QOS_SHIFT = 3;
            module.exports.WILL_FLAG_MASK = 4;
            module.exports.CLEAN_SESSION_MASK = 2
        }, {}],
        41: [function(require, module, exports) {
            (function(Buffer) {
                "use strict";
                var protocol = require("./constants"),
                    empty = new Buffer(0);

                function generate(packet) {
                    switch (packet.cmd) {
                        case "connect":
                            return connect(packet);
                        case "connack":
                            return connack(packet);
                        case "publish":
                            return publish(packet);
                        case "puback":
                        case "pubrec":
                        case "pubrel":
                        case "pubcomp":
                        case "unsuback":
                            return confirmation(packet);
                        case "subscribe":
                            return subscribe(packet);
                        case "suback":
                            return suback(packet);
                        case "unsubscribe":
                            return unsubscribe(packet);
                        case "pingreq":
                        case "pingresp":
                        case "disconnect":
                            return emptyPacket(packet);
                        default:
                            throw new Error("unknown command")
                    }
                }

                function connect(opts) {
                    var opts = opts || {},
                        protocolId = opts.protocolId || "MQTT",
                        protocolVersion = opts.protocolVersion || 4,
                        will = opts.will,
                        clean = opts.clean,
                        keepalive = opts.keepalive || 0,
                        clientId = opts.clientId,
                        username = opts.username,
                        password = opts.password;
                    if (clean === undefined) {
                        clean = true
                    }
                    var length = 0;
                    if (!protocolId || typeof protocolId !== "string" && !Buffer.isBuffer(protocolId)) {
                        throw new Error("Invalid protocol id")
                    } else {
                        length += protocolId.length + 2
                    }
                    if (!protocolVersion || "number" !== typeof protocolVersion || protocolVersion > 255 || protocolVersion < 0) {
                        throw new Error("Invalid protocol version")
                    } else {
                        length += 1
                    }
                    if (!clientId || typeof clientId !== "string" && !Buffer.isBuffer(clientId)) {
                        throw new Error("Invalid client id")
                    } else {
                        length += clientId.length + 2
                    }
                    if ("number" !== typeof keepalive || keepalive < 0 || keepalive > 65535) {
                        throw new Error("Invalid keepalive")
                    } else {
                        length += 2
                    }
                    length += 1;
                    if (will) {
                        if ("object" !== typeof will) {
                            throw new Error("Invalid will")
                        }
                        if (!will.topic || "string" !== typeof will.topic) {
                            throw new Error("Invalid will topic")
                        } else {
                            length += will.topic.length + 2
                        }
                        if (will.payload && will.payload) {
                            if (will.payload.length >= 0) {
                                if ("string" === typeof will.payload) {
                                    length += Buffer.byteLength(will.payload) + 2
                                } else {
                                    length += will.payload.length + 2
                                }
                            } else {
                                throw new Error("Invalid will payload")
                            }
                        } else {
                            length += 2
                        }
                    }
                    if (username) {
                        if (username.length) {
                            length += username.length + 2
                        } else {
                            throw new Error("Invalid username")
                        }
                    }
                    if (password) {
                        if (password.length) {
                            length += password.length + 2
                        } else {
                            throw new Error("Invalid password")
                        }
                    }
                    var buffer = new Buffer(1 + calcLengthLength(length) + length),
                        pos = 0;
                    buffer.writeUInt8(protocol.codes["connect"] << protocol.CMD_SHIFT, pos++);
                    pos += writeLength(buffer, pos, length);
                    pos += writeStringOrBuffer(buffer, pos, protocolId);
                    buffer.writeUInt8(protocolVersion, pos++);
                    var flags = 0;
                    flags |= username ? protocol.USERNAME_MASK : 0;
                    flags |= password ? protocol.PASSWORD_MASK : 0;
                    flags |= will && will.retain ? protocol.WILL_RETAIN_MASK : 0;
                    flags |= will && will.qos ? will.qos << protocol.WILL_QOS_SHIFT : 0;
                    flags |= will ? protocol.WILL_FLAG_MASK : 0;
                    flags |= clean ? protocol.CLEAN_SESSION_MASK : 0;
                    buffer.writeUInt8(flags, pos++);
                    pos += writeNumber(buffer, pos, keepalive);
                    pos += writeStringOrBuffer(buffer, pos, clientId);
                    if (will) {
                        pos += writeString(buffer, pos, will.topic);
                        pos += writeStringOrBuffer(buffer, pos, will.payload)
                    }
                    if (username) pos += writeStringOrBuffer(buffer, pos, username);
                    if (password) pos += writeStringOrBuffer(buffer, pos, password);
                    return buffer
                }

                function connack(opts) {
                    var opts = opts || {},
                        rc = opts.returnCode;
                    if ("number" !== typeof rc) throw new Error("Invalid return code");
                    var buffer = new Buffer(4),
                        pos = 0;
                    buffer.writeUInt8(protocol.codes["connack"] << protocol.CMD_SHIFT, pos++);
                    pos += writeLength(buffer, pos, 2);
                    buffer.writeUInt8(opts.sessionPresent && protocol.SESSIONPRESENT_MASK || 0, pos++);
                    buffer.writeUInt8(rc, pos++);
                    return buffer
                }

                function publish(opts) {
                    var opts = opts || {},
                        dup = opts.dup ? protocol.DUP_MASK : 0,
                        qos = opts.qos,
                        retain = opts.retain ? protocol.RETAIN_MASK : 0,
                        topic = opts.topic,
                        payload = opts.payload || empty,
                        id = opts.messageId;
                    var length = 0;
                    if (typeof topic === "string") length += Buffer.byteLength(topic) + 2;
                    else if (Buffer.isBuffer(topic)) length += topic.length + 2;
                    else throw new Error("Invalid topic");
                    if (!Buffer.isBuffer(payload)) {
                        length += Buffer.byteLength(payload)
                    } else {
                        length += payload.length
                    }
                    if (qos && "number" !== typeof id) {
                        throw new Error("Invalid message id")
                    } else if (qos) {
                        length += 2
                    }
                    var buffer = new Buffer(1 + calcLengthLength(length) + length),
                        pos = 0;
                    buffer[pos++] = protocol.codes["publish"] << protocol.CMD_SHIFT | dup | qos << protocol.QOS_SHIFT | retain;
                    pos += writeLength(buffer, pos, length);
                    pos += writeStringOrBuffer(buffer, pos, topic);
                    if (qos > 0) {
                        pos += writeNumber(buffer, pos, id)
                    }
                    if (!Buffer.isBuffer(payload)) {
                        writeStringNoPos(buffer, pos, payload)
                    } else {
                        writeBuffer(buffer, pos, payload)
                    }
                    return buffer
                }

                function confirmation(opts) {
                    var opts = opts || {},
                        type = opts.cmd || "puback",
                        id = opts.messageId,
                        dup = opts.dup && type === "pubrel" ? protocol.DUP_MASK : 0,
                        qos = 0;
                    if (type === "pubrel") qos = 1;
                    else if (type === "pubcomp") qos = 2;
                    if ("number" !== typeof id) throw new Error("Invalid message id");
                    var buffer = new Buffer(4),
                        pos = 0;
                    buffer[pos++] = protocol.codes[type] << protocol.CMD_SHIFT | dup | qos << protocol.QOS_SHIFT;
                    pos += writeLength(buffer, pos, 2);
                    pos += writeNumber(buffer, pos, id);
                    return buffer
                }

                function subscribe(opts) {
                    var opts = opts || {},
                        dup = opts.dup ? protocol.DUP_MASK : 0,
                        qos = opts.qos || 0,
                        id = opts.messageId,
                        subs = opts.subscriptions;
                    var length = 0;
                    if ("number" !== typeof id) {
                        throw new Error("Invalid message id")
                    } else {
                        length += 2
                    }
                    if ("object" === typeof subs && subs.length) {
                        for (var i = 0; i < subs.length; i += 1) {
                            var topic = subs[i].topic,
                                qos = subs[i].qos;
                            if ("string" !== typeof topic) {
                                throw new Error("Invalid subscriptions - invalid topic")
                            }
                            if ("number" !== typeof qos) {
                                throw new Error("Invalid subscriptions - invalid qos")
                            }
                            length += Buffer.byteLength(topic) + 2 + 1
                        }
                    } else {
                        throw new Error("Invalid subscriptions")
                    }
                    var buffer = new Buffer(1 + calcLengthLength(length) + length),
                        pos = 0;
                    buffer.writeUInt8(protocol.codes["subscribe"] << protocol.CMD_SHIFT | dup | 1 << protocol.QOS_SHIFT, pos++);
                    pos += writeLength(buffer, pos, length);
                    pos += writeNumber(buffer, pos, id);
                    for (var i = 0; i < subs.length; i++) {
                        var sub = subs[i],
                            topic = sub.topic,
                            qos = sub.qos;
                        pos += writeString(buffer, pos, topic);
                        buffer.writeUInt8(qos, pos++)
                    }
                    return buffer
                }

                function suback(opts) {
                    var opts = opts || {},
                        id = opts.messageId,
                        granted = opts.granted;
                    var length = 0;
                    if ("number" !== typeof id) {
                        throw new Error("Invalid message id")
                    } else {
                        length += 2
                    }
                    if ("object" === typeof granted && granted.length) {
                        for (var i = 0; i < granted.length; i += 1) {
                            if ("number" !== typeof granted[i]) {
                                throw new Error("Invalid qos vector")
                            }
                            length += 1
                        }
                    } else {
                        throw new Error("Invalid qos vector")
                    }
                    var buffer = new Buffer(1 + calcLengthLength(length) + length),
                        pos = 0;
                    buffer.writeUInt8(protocol.codes["suback"] << protocol.CMD_SHIFT, pos++);
                    pos += writeLength(buffer, pos, length);
                    pos += writeNumber(buffer, pos, id);
                    for (var i = 0; i < granted.length; i++) {
                        buffer.writeUInt8(granted[i], pos++)
                    }
                    return buffer
                }

                function unsubscribe(opts) {
                    var opts = opts || {},
                        id = opts.messageId,
                        dup = opts.dup ? protocol.DUP_MASK : 0,
                        unsubs = opts.unsubscriptions;
                    var length = 0;
                    if ("number" !== typeof id) {
                        throw new Error("Invalid message id")
                    } else {
                        length += 2
                    }
                    if ("object" === typeof unsubs && unsubs.length) {
                        for (var i = 0; i < unsubs.length; i += 1) {
                            if ("string" !== typeof unsubs[i]) {
                                throw new Error("Invalid unsubscriptions")
                            }
                            length += Buffer.byteLength(unsubs[i]) + 2
                        }
                    } else {
                        throw new Error("Invalid unsubscriptions")
                    }
                    var buffer = new Buffer(1 + calcLengthLength(length) + length),
                        pos = 0;
                    buffer[pos++] = protocol.codes["unsubscribe"] << protocol.CMD_SHIFT | dup | 1 << protocol.QOS_SHIFT;
                    pos += writeLength(buffer, pos, length);
                    pos += writeNumber(buffer, pos, id);
                    for (var i = 0; i < unsubs.length; i++) {
                        pos += writeString(buffer, pos, unsubs[i])
                    }
                    return buffer
                }

                function emptyPacket(opts) {
                    var buf = new Buffer(2);
                    buf[0] = protocol.codes[opts.cmd] << 4;
                    buf[1] = 0;
                    return buf
                }

                function calcLengthLength(length) {
                    if (length >= 0 && length < 128) {
                        return 1
                    } else if (length >= 128 && length < 16384) {
                        return 2
                    } else if (length >= 16384 && length < 2097152) {
                        return 3
                    } else if (length >= 2097152 && length < 268435456) {
                        return 4
                    } else {
                        return 0
                    }
                }

                function writeLength(buffer, pos, length) {
                    var digit = 0,
                        origPos = pos;
                    do {
                        digit = length % 128 | 0;
                        length = length / 128 | 0;
                        if (length > 0) {
                            digit = digit | 128
                        }
                        buffer.writeUInt8(digit, pos++)
                    } while (length > 0);
                    return pos - origPos
                }

                function writeString(buffer, pos, string) {
                    var strlen = Buffer.byteLength(string);
                    writeNumber(buffer, pos, strlen);
                    writeStringNoPos(buffer, pos + 2, string);
                    return strlen + 2
                }

                function writeStringNoPos(buffer, pos, string) {
                    buffer.write(string, pos)
                }

                function writeBuffer(buffer, pos, src) {
                    src.copy(buffer, pos);
                    return src.length
                }

                function writeNumber(buffer, pos, number) {
                    buffer.writeUInt8(number >> 8, pos);
                    buffer.writeUInt8(number & 255, pos + 1);
                    return 2
                }

                function writeStringOrBuffer(buffer, pos, toWrite) {
                    var written = 0;
                    if (toWrite && typeof toWrite === "string") {
                        written += writeString(buffer, pos + written, toWrite)
                    } else if (toWrite) {
                        written += writeNumber(buffer, pos + written, toWrite.length);
                        written += writeBuffer(buffer, pos + written, toWrite)
                    } else {
                        written += writeNumber(buffer, pos + written, 0)
                    }
                    return written
                }
                module.exports = generate
            }).call(this, require("buffer").Buffer)
        }, {
            "./constants": 40,
            buffer: 3
        }],
        42: [function(require, module, exports) {
            "use strict";
            exports.parser = require("./parser");
            exports.generate = require("./generate")
        }, {
            "./generate": 41,
            "./parser": 45
        }],
        43: [function(require, module, exports) {
            (function(Buffer) {
                var DuplexStream = require("readable-stream/duplex"),
                    util = require("util");

                function BufferList(callback) {
                    if (!(this instanceof BufferList)) return new BufferList(callback);
                    this._bufs = [];
                    this.length = 0;
                    if (typeof callback == "function") {
                        this._callback = callback;
                        var piper = function(err) {
                            if (this._callback) {
                                this._callback(err);
                                this._callback = null
                            }
                        }.bind(this);
                        this.on("pipe", function(src) {
                            src.on("error", piper)
                        });
                        this.on("unpipe", function(src) {
                            src.removeListener("error", piper)
                        })
                    } else if (Buffer.isBuffer(callback)) this.append(callback);
                    else if (Array.isArray(callback)) {
                        callback.forEach(function(b) {
                            Buffer.isBuffer(b) && this.append(b)
                        }.bind(this))
                    }
                    DuplexStream.call(this)
                }
                util.inherits(BufferList, DuplexStream);
                BufferList.prototype._offset = function(offset) {
                    var tot = 0,
                        i = 0,
                        _t;
                    for (; i < this._bufs.length; i++) {
                        _t = tot + this._bufs[i].length;
                        if (offset < _t) return [i, offset - tot];
                        tot = _t
                    }
                };
                BufferList.prototype.append = function(buf) {
                    var isBuffer = Buffer.isBuffer(buf) || buf instanceof BufferList;
                    this._bufs.push(isBuffer ? buf : new Buffer(buf));
                    this.length += buf.length;
                    return this
                };
                BufferList.prototype._write = function(buf, encoding, callback) {
                    this.append(buf);
                    if (callback) callback()
                };
                BufferList.prototype._read = function(size) {
                    if (!this.length) return this.push(null);
                    size = Math.min(size, this.length);
                    this.push(this.slice(0, size));
                    this.consume(size)
                };
                BufferList.prototype.end = function(chunk) {
                    DuplexStream.prototype.end.call(this, chunk);
                    if (this._callback) {
                        this._callback(null, this.slice());
                        this._callback = null
                    }
                };
                BufferList.prototype.get = function(index) {
                    return this.slice(index, index + 1)[0]
                };
                BufferList.prototype.slice = function(start, end) {
                    return this.copy(null, 0, start, end)
                };
                BufferList.prototype.copy = function(dst, dstStart, srcStart, srcEnd) {
                    if (typeof srcStart != "number" || srcStart < 0) srcStart = 0;
                    if (typeof srcEnd != "number" || srcEnd > this.length) srcEnd = this.length;
                    if (srcStart >= this.length) return dst || new Buffer(0);
                    if (srcEnd <= 0) return dst || new Buffer(0);
                    var copy = !!dst,
                        off = this._offset(srcStart),
                        len = srcEnd - srcStart,
                        bytes = len,
                        bufoff = copy && dstStart || 0,
                        start = off[1],
                        l, i;
                    if (srcStart === 0 && srcEnd == this.length) {
                        if (!copy) return Buffer.concat(this._bufs);
                        for (i = 0; i < this._bufs.length; i++) {
                            this._bufs[i].copy(dst, bufoff);
                            bufoff += this._bufs[i].length
                        }
                        return dst
                    }
                    if (bytes <= this._bufs[off[0]].length - start) {
                        return copy ? this._bufs[off[0]].copy(dst, dstStart, start, start + bytes) : this._bufs[off[0]].slice(start, start + bytes)
                    }
                    if (!copy) dst = new Buffer(len);
                    for (i = off[0]; i < this._bufs.length; i++) {
                        l = this._bufs[i].length - start;
                        if (bytes > l) {
                            this._bufs[i].copy(dst, bufoff, start)
                        } else {
                            this._bufs[i].copy(dst, bufoff, start, start + bytes);
                            break
                        }
                        bufoff += l;
                        bytes -= l;
                        if (start) start = 0
                    }
                    return dst
                };
                BufferList.prototype.toString = function(encoding, start, end) {
                    return this.slice(start, end).toString(encoding)
                };
                BufferList.prototype.consume = function(bytes) {
                    while (this._bufs.length) {
                        if (bytes > this._bufs[0].length) {
                            bytes -= this._bufs[0].length;
                            this.length -= this._bufs[0].length;
                            this._bufs.shift()
                        } else {
                            this._bufs[0] = this._bufs[0].slice(bytes);
                            this.length -= bytes;
                            break
                        }
                    }
                    return this
                };
                BufferList.prototype.duplicate = function() {
                    var i = 0,
                        copy = new BufferList;
                    for (; i < this._bufs.length; i++) copy.append(this._bufs[i]);
                    return copy
                };
                BufferList.prototype.destroy = function() {
                    this._bufs.length = 0;
                    this.length = 0;
                    this.push(null)
                };
                (function() {
                    var methods = {
                        readDoubleBE: 8,
                        readDoubleLE: 8,
                        readFloatBE: 4,
                        readFloatLE: 4,
                        readInt32BE: 4,
                        readInt32LE: 4,
                        readUInt32BE: 4,
                        readUInt32LE: 4,
                        readInt16BE: 2,
                        readInt16LE: 2,
                        readUInt16BE: 2,
                        readUInt16LE: 2,
                        readInt8: 1,
                        readUInt8: 1
                    };
                    for (var m in methods) {
                        (function(m) {
                            BufferList.prototype[m] = function(offset) {
                                return this.slice(offset, offset + methods[m])[m](0)
                            }
                        })(m)
                    }
                })();
                module.exports = BufferList
            }).call(this, require("buffer").Buffer)
        }, {
            buffer: 3,
            "readable-stream/duplex": 46,
            util: 30
        }],
        44: [function(require, module, exports) {
            function Packet() {
                this.cmd = null;
                this.retain = false;
                this.qos = 0;
                this.dup = false;
                this.length = -1;
                this.topic = null;
                this.payload = null
            }
            module.exports = Packet
        }, {}],
        45: [function(require, module, exports) {
            var bl = require("bl"),
                inherits = require("inherits"),
                EE = require("events").EventEmitter,
                Packet = require("./packet"),
                constants = require("./constants");

            function Parser() {
                if (!(this instanceof Parser)) {
                    return new Parser
                }
                this._list = bl();
                this._newPacket();
                this._states = ["_parseHeader", "_parseLength", "_parsePayload", "_newPacket"];
                this._stateCounter = 0
            }
            inherits(Parser, EE);
            Parser.prototype._newPacket = function() {
                if (this.packet) {
                    this._list.consume(this.packet.length);
                    this.emit("packet", this.packet)
                }
                this.packet = new Packet;
                return true
            };
            Parser.prototype.parse = function(buf) {
                this._list.append(buf);
                while ((this.packet.length != -1 || this._list.length > 0) && this[this._states[this._stateCounter]]()) {
                    this._stateCounter++;
                    if (this._stateCounter >= this._states.length) {
                        this._stateCounter = 0
                    }
                }
                return this._list.length
            };
            Parser.prototype._parseHeader = function() {
                var zero = this._list.readUInt8(0);
                this.packet.cmd = constants.types[zero >> constants.CMD_SHIFT];
                this.packet.retain = (zero & constants.RETAIN_MASK) !== 0;
                this.packet.qos = zero >> constants.QOS_SHIFT & constants.QOS_MASK;
                this.packet.dup = (zero & constants.DUP_MASK) !== 0;
                this._list.consume(1);
                return true
            };
            Parser.prototype._parseLength = function() {
                var bytes = 0,
                    mul = 1,
                    length = 0,
                    result = true,
                    current;
                while (bytes < 5) {
                    current = this._list.readUInt8(bytes++);
                    length += mul * (current & constants.LENGTH_MASK);
                    mul *= 128;
                    if ((current & constants.LENGTH_FIN_MASK) === 0) {
                        break
                    }
                    if (this._list.length <= bytes) {
                        result = false;
                        break
                    }
                }
                if (result) {
                    this.packet.length = length;
                    this._list.consume(bytes)
                }
                return result
            };
            Parser.prototype._parsePayload = function() {
                var result = false;
                if (this.packet.length === 0 || this._list.length >= this.packet.length) {
                    this._pos = 0;
                    switch (this.packet.cmd) {
                        case "connect":
                            this._parseConnect();
                            break;
                        case "connack":
                            this._parseConnack();
                            break;
                        case "publish":
                            this._parsePublish();
                            break;
                        case "puback":
                        case "pubrec":
                        case "pubrel":
                        case "pubcomp":
                            this._parseMessageId();
                            break;
                        case "subscribe":
                            this._parseSubscribe();
                            break;
                        case "suback":
                            this._parseSuback();
                            break;
                        case "unsubscribe":
                            this._parseUnsubscribe();
                            break;
                        case "unsuback":
                            this._parseUnsuback();
                            break;
                        case "pingreq":
                        case "pingresp":
                        case "disconnect":
                            break;
                        default:
                            this.emit("error", new Error("not supported"))
                    }
                    result = true
                }
                return result
            };
            Parser.prototype._parseConnect = function() {
                var protocolId, clientId, topic, payload, password, username, flags = {},
                    packet = this.packet;
                protocolId = this._parseString();
                if (protocolId === null) return this.emit("error", new Error("cannot parse protocol id"));
                packet.protocolId = protocolId;
                if (this._pos > this._list.length) return this.emit("error", new Error("packet too short"));
                packet.protocolVersion = this._list.readUInt8(this._pos);
                this._pos++;
                flags.username = this._list.readUInt8(this._pos) & constants.USERNAME_MASK;
                flags.password = this._list.readUInt8(this._pos) & constants.PASSWORD_MASK;
                flags.will = this._list.readUInt8(this._pos) & constants.WILL_FLAG_MASK;
                if (flags.will) {
                    packet.will = {};
                    packet.will.retain = (this._list.readUInt8(this._pos) & constants.WILL_RETAIN_MASK) !== 0;
                    packet.will.qos = (this._list.readUInt8(this._pos) & constants.WILL_QOS_MASK) >> constants.WILL_QOS_SHIFT
                }
                packet.clean = (this._list.readUInt8(this._pos) & constants.CLEAN_SESSION_MASK) !== 0;
                this._pos++;
                packet.keepalive = this._parseNum();
                if (packet.keepalive === -1) return this.emit("error", new Error("packet too short"));
                clientId = this._parseString();
                if (clientId === null) return this.emit("error", new Error("packet too short"));
                packet.clientId = clientId;
                if (flags.will) {
                    topic = this._parseString();
                    if (topic === null) return this.emit("error", new Error("cannot parse will topic"));
                    packet.will.topic = topic;
                    payload = this._parseBuffer();
                    if (payload === null) return this.emit("error", new Error("cannot parse will payload"));
                    packet.will.payload = payload
                }
                if (flags.username) {
                    username = this._parseString();
                    if (username === null) return this.emit("error", new Error("cannot parse username"));
                    packet.username = username
                }
                if (flags.password) {
                    password = this._parseBuffer();
                    if (password === null) return this.emit("error", new Error("cannot parse username"));
                    packet.password = password
                }
                return packet
            };
            Parser.prototype._parseConnack = function() {
                var packet = this.packet;
                packet.sessionPresent = !!(this._list.readUInt8(this._pos++) & constants.SESSIONPRESENT_MASK);
                packet.returnCode = this._list.readUInt8(this._pos);
                if (packet.returnCode === -1) return this.emit("error", new Error("cannot parse return code"))
            };
            Parser.prototype._parsePublish = function() {
                var packet = this.packet;
                packet.topic = this._parseString();
                if (packet.topic === null) return this.emit("error", new Error("cannot parse topic"));
                if (packet.qos > 0) {
                    if (!this._parseMessageId()) {
                        return
                    }
                }
                packet.payload = this._list.slice(this._pos, packet.length)
            };
            Parser.prototype._parseSubscribe = function() {
                var packet = this.packet,
                    topic, qos;
                if (packet.qos != 1) {
                    return this.emit("error", new Error("wrong subscribe header"))
                }
                packet.subscriptions = [];
                if (!this._parseMessageId()) {
                    return
                }
                while (this._pos < packet.length) {
                    topic = this._parseString();
                    if (topic === null) return this.emit("error", new Error("Parse error - cannot parse topic"));
                    qos = this._list.readUInt8(this._pos++);
                    packet.subscriptions.push({
                        topic: topic,
                        qos: qos
                    })
                }
            };
            Parser.prototype._parseSuback = function() {
                this.packet.granted = [];
                if (!this._parseMessageId()) {
                    return
                }
                while (this._pos < this.packet.length) {
                    this.packet.granted.push(this._list.readUInt8(this._pos++))
                }
            };
            Parser.prototype._parseUnsubscribe = function() {
                var packet = this.packet;
                packet.unsubscriptions = [];
                if (!this._parseMessageId()) {
                    return
                }
                while (this._pos < packet.length) {
                    var topic;
                    topic = this._parseString();
                    if (topic === null) return this.emit("error", new Error("cannot parse topic"));
                    packet.unsubscriptions.push(topic)
                }
            };
            Parser.prototype._parseUnsuback = function() {
                if (!this._parseMessageId()) return this.emit("error", new Error("cannot parse message id"))
            };
            Parser.prototype._parseMessageId = function() {
                var packet = this.packet;
                packet.messageId = this._parseNum();
                if (packet.messageId === null) {
                    this.emit("error", new Error("cannot parse message id"));
                    return false
                }
                return true
            };
            Parser.prototype._parseString = function(maybeBuffer) {
                var length = this._parseNum(),
                    result;
                if (length === -1 || length + this._pos > this._list.length) return null;
                result = this._list.toString("utf8", this._pos, this._pos + length);
                this._pos += length;
                return result
            };
            Parser.prototype._parseBuffer = function() {
                var length = this._parseNum(),
                    result;
                if (length === -1 || length + this._pos > this._list.length) return null;
                result = this._list.slice(this._pos, this._pos + length);
                this._pos += length;
                return result
            };
            Parser.prototype._parseNum = function() {
                if (2 > this._pos + this._list.length) return -1;
                var result = this._list.readUInt16BE(this._pos);
                this._pos += 2;
                return result
            };
            module.exports = Parser
        }, {
            "./constants": 40,
            "./packet": 44,
            bl: 43,
            events: 7,
            inherits: 39
        }],
        46: [function(require, module, exports) {
            arguments[4][15][0].apply(exports, arguments)
        }, {
            "./lib/_stream_duplex.js": 47,
            dup: 15
        }],
        47: [function(require, module, exports) {
            arguments[4][16][0].apply(exports, arguments)
        }, {
            "./_stream_readable": 49,
            "./_stream_writable": 51,
            _process: 10,
            "core-util-is": 52,
            dup: 16,
            inherits: 39
        }],
        48: [function(require, module, exports) {
            arguments[4][17][0].apply(exports, arguments)
        }, {
            "./_stream_transform": 50,
            "core-util-is": 52,
            dup: 17,
            inherits: 39
        }],
        49: [function(require, module, exports) {
            (function(process) {
                module.exports = Readable;
                var isArray = require("isarray");
                var Buffer = require("buffer").Buffer;
                Readable.ReadableState = ReadableState;
                var EE = require("events").EventEmitter;
                if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
                    return emitter.listeners(type).length
                };
                var Stream = require("stream");
                var util = require("core-util-is");
                util.inherits = require("inherits");
                var StringDecoder;
                util.inherits(Readable, Stream);

                function ReadableState(options, stream) {
                    options = options || {};
                    var hwm = options.highWaterMark;
                    this.highWaterMark = hwm || hwm === 0 ? hwm : 16 * 1024;
                    this.highWaterMark = ~~this.highWaterMark;
                    this.buffer = [];
                    this.length = 0;
                    this.pipes = null;
                    this.pipesCount = 0;
                    this.flowing = false;
                    this.ended = false;
                    this.endEmitted = false;
                    this.reading = false;
                    this.calledRead = false;
                    this.sync = true;
                    this.needReadable = false;
                    this.emittedReadable = false;
                    this.readableListening = false;
                    this.objectMode = !!options.objectMode;
                    this.defaultEncoding = options.defaultEncoding || "utf8";
                    this.ranOut = false;
                    this.awaitDrain = 0;
                    this.readingMore = false;
                    this.decoder = null;
                    this.encoding = null;
                    if (options.encoding) {
                        if (!StringDecoder) StringDecoder = require("string_decoder/").StringDecoder;
                        this.decoder = new StringDecoder(options.encoding);
                        this.encoding = options.encoding
                    }
                }

                function Readable(options) {
                    if (!(this instanceof Readable)) return new Readable(options);
                    this._readableState = new ReadableState(options, this);
                    this.readable = true;
                    Stream.call(this)
                }
                Readable.prototype.push = function(chunk, encoding) {
                    var state = this._readableState;
                    if (typeof chunk === "string" && !state.objectMode) {
                        encoding = encoding || state.defaultEncoding;
                        if (encoding !== state.encoding) {
                            chunk = new Buffer(chunk, encoding);
                            encoding = ""
                        }
                    }
                    return readableAddChunk(this, state, chunk, encoding, false)
                };
                Readable.prototype.unshift = function(chunk) {
                    var state = this._readableState;
                    return readableAddChunk(this, state, chunk, "", true)
                };

                function readableAddChunk(stream, state, chunk, encoding, addToFront) {
                    var er = chunkInvalid(state, chunk);
                    if (er) {
                        stream.emit("error", er)
                    } else if (chunk === null || chunk === undefined) {
                        state.reading = false;
                        if (!state.ended) onEofChunk(stream, state)
                    } else if (state.objectMode || chunk && chunk.length > 0) {
                        if (state.ended && !addToFront) {
                            var e = new Error("stream.push() after EOF");
                            stream.emit("error", e)
                        } else if (state.endEmitted && addToFront) {
                            var e = new Error("stream.unshift() after end event");
                            stream.emit("error", e)
                        } else {
                            if (state.decoder && !addToFront && !encoding) chunk = state.decoder.write(chunk);
                            state.length += state.objectMode ? 1 : chunk.length;
                            if (addToFront) {
                                state.buffer.unshift(chunk)
                            } else {
                                state.reading = false;
                                state.buffer.push(chunk)
                            }
                            if (state.needReadable) emitReadable(stream);
                            maybeReadMore(stream, state)
                        }
                    } else if (!addToFront) {
                        state.reading = false
                    }
                    return needMoreData(state)
                }

                function needMoreData(state) {
                    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0)
                }
                Readable.prototype.setEncoding = function(enc) {
                    if (!StringDecoder) StringDecoder = require("string_decoder/").StringDecoder;
                    this._readableState.decoder = new StringDecoder(enc);
                    this._readableState.encoding = enc
                };
                var MAX_HWM = 8388608;

                function roundUpToNextPowerOf2(n) {
                    if (n >= MAX_HWM) {
                        n = MAX_HWM
                    } else {
                        n--;
                        for (var p = 1; p < 32; p <<= 1) n |= n >> p;
                        n++
                    }
                    return n
                }

                function howMuchToRead(n, state) {
                    if (state.length === 0 && state.ended) return 0;
                    if (state.objectMode) return n === 0 ? 0 : 1;
                    if (n === null || isNaN(n)) {
                        if (state.flowing && state.buffer.length) return state.buffer[0].length;
                        else return state.length
                    }
                    if (n <= 0) return 0;
                    if (n > state.highWaterMark) state.highWaterMark = roundUpToNextPowerOf2(n);
                    if (n > state.length) {
                        if (!state.ended) {
                            state.needReadable = true;
                            return 0
                        } else return state.length
                    }
                    return n
                }
                Readable.prototype.read = function(n) {
                    var state = this._readableState;
                    state.calledRead = true;
                    var nOrig = n;
                    var ret;
                    if (typeof n !== "number" || n > 0) state.emittedReadable = false;
                    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
                        emitReadable(this);
                        return null
                    }
                    n = howMuchToRead(n, state);
                    if (n === 0 && state.ended) {
                        ret = null;
                        if (state.length > 0 && state.decoder) {
                            ret = fromList(n, state);
                            state.length -= ret.length
                        }
                        if (state.length === 0) endReadable(this);
                        return ret
                    }
                    var doRead = state.needReadable;
                    if (state.length - n <= state.highWaterMark) doRead = true;
                    if (state.ended || state.reading) doRead = false;
                    if (doRead) {
                        state.reading = true;
                        state.sync = true;
                        if (state.length === 0) state.needReadable = true;
                        this._read(state.highWaterMark);
                        state.sync = false
                    }
                    if (doRead && !state.reading) n = howMuchToRead(nOrig, state);
                    if (n > 0) ret = fromList(n, state);
                    else ret = null;
                    if (ret === null) {
                        state.needReadable = true;
                        n = 0
                    }
                    state.length -= n;
                    if (state.length === 0 && !state.ended) state.needReadable = true;
                    if (state.ended && !state.endEmitted && state.length === 0) endReadable(this);
                    return ret
                };

                function chunkInvalid(state, chunk) {
                    var er = null;
                    if (!Buffer.isBuffer(chunk) && "string" !== typeof chunk && chunk !== null && chunk !== undefined && !state.objectMode) {
                        er = new TypeError("Invalid non-string/buffer chunk")
                    }
                    return er
                }

                function onEofChunk(stream, state) {
                    if (state.decoder && !state.ended) {
                        var chunk = state.decoder.end();
                        if (chunk && chunk.length) {
                            state.buffer.push(chunk);
                            state.length += state.objectMode ? 1 : chunk.length
                        }
                    }
                    state.ended = true;
                    if (state.length > 0) emitReadable(stream);
                    else endReadable(stream)
                }

                function emitReadable(stream) {
                    var state = stream._readableState;
                    state.needReadable = false;
                    if (state.emittedReadable) return;
                    state.emittedReadable = true;
                    if (state.sync) process.nextTick(function() {
                        emitReadable_(stream)
                    });
                    else emitReadable_(stream)
                }

                function emitReadable_(stream) {
                    stream.emit("readable")
                }

                function maybeReadMore(stream, state) {
                    if (!state.readingMore) {
                        state.readingMore = true;
                        process.nextTick(function() {
                            maybeReadMore_(stream, state)
                        })
                    }
                }

                function maybeReadMore_(stream, state) {
                    var len = state.length;
                    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
                        stream.read(0);
                        if (len === state.length) break;
                        else len = state.length
                    }
                    state.readingMore = false
                }
                Readable.prototype._read = function(n) {
                    this.emit("error", new Error("not implemented"))
                };
                Readable.prototype.pipe = function(dest, pipeOpts) {
                    var src = this;
                    var state = this._readableState;
                    switch (state.pipesCount) {
                        case 0:
                            state.pipes = dest;
                            break;
                        case 1:
                            state.pipes = [state.pipes, dest];
                            break;
                        default:
                            state.pipes.push(dest);
                            break
                    }
                    state.pipesCount += 1;
                    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
                    var endFn = doEnd ? onend : cleanup;
                    if (state.endEmitted) process.nextTick(endFn);
                    else src.once("end", endFn);
                    dest.on("unpipe", onunpipe);

                    function onunpipe(readable) {
                        if (readable !== src) return;
                        cleanup()
                    }

                    function onend() {
                        dest.end()
                    }
                    var ondrain = pipeOnDrain(src);
                    dest.on("drain", ondrain);

                    function cleanup() {
                        dest.removeListener("close", onclose);
                        dest.removeListener("finish", onfinish);
                        dest.removeListener("drain", ondrain);
                        dest.removeListener("error", onerror);
                        dest.removeListener("unpipe", onunpipe);
                        src.removeListener("end", onend);
                        src.removeListener("end", cleanup);
                        if (!dest._writableState || dest._writableState.needDrain) ondrain()
                    }

                    function onerror(er) {
                        unpipe();
                        dest.removeListener("error", onerror);
                        if (EE.listenerCount(dest, "error") === 0) dest.emit("error", er)
                    }
                    if (!dest._events || !dest._events.error) dest.on("error", onerror);
                    else if (isArray(dest._events.error)) dest._events.error.unshift(onerror);
                    else dest._events.error = [onerror, dest._events.error];

                    function onclose() {
                        dest.removeListener("finish", onfinish);
                        unpipe()
                    }
                    dest.once("close", onclose);

                    function onfinish() {
                        dest.removeListener("close", onclose);
                        unpipe()
                    }
                    dest.once("finish", onfinish);

                    function unpipe() {
                        src.unpipe(dest)
                    }
                    dest.emit("pipe", src);
                    if (!state.flowing) {
                        this.on("readable", pipeOnReadable);
                        state.flowing = true;
                        process.nextTick(function() {
                            flow(src)
                        })
                    }
                    return dest
                };

                function pipeOnDrain(src) {
                    return function() {
                        var dest = this;
                        var state = src._readableState;
                        state.awaitDrain--;
                        if (state.awaitDrain === 0) flow(src)
                    }
                }

                function flow(src) {
                    var state = src._readableState;
                    var chunk;
                    state.awaitDrain = 0;

                    function write(dest, i, list) {
                        var written = dest.write(chunk);
                        if (false === written) {
                            state.awaitDrain++
                        }
                    }
                    while (state.pipesCount && null !== (chunk = src.read())) {
                        if (state.pipesCount === 1) write(state.pipes, 0, null);
                        else forEach(state.pipes, write);
                        src.emit("data", chunk);
                        if (state.awaitDrain > 0) return
                    }
                    if (state.pipesCount === 0) {
                        state.flowing = false;
                        if (EE.listenerCount(src, "data") > 0) emitDataEvents(src);
                        return
                    }
                    state.ranOut = true
                }

                function pipeOnReadable() {
                    if (this._readableState.ranOut) {
                        this._readableState.ranOut = false;
                        flow(this)
                    }
                }
                Readable.prototype.unpipe = function(dest) {
                    var state = this._readableState;
                    if (state.pipesCount === 0) return this;
                    if (state.pipesCount === 1) {
                        if (dest && dest !== state.pipes) return this;
                        if (!dest) dest = state.pipes;
                        state.pipes = null;
                        state.pipesCount = 0;
                        this.removeListener("readable", pipeOnReadable);
                        state.flowing = false;
                        if (dest) dest.emit("unpipe", this);
                        return this
                    }
                    if (!dest) {
                        var dests = state.pipes;
                        var len = state.pipesCount;
                        state.pipes = null;
                        state.pipesCount = 0;
                        this.removeListener("readable", pipeOnReadable);
                        state.flowing = false;
                        for (var i = 0; i < len; i++) dests[i].emit("unpipe", this);
                        return this
                    }
                    var i = indexOf(state.pipes, dest);
                    if (i === -1) return this;
                    state.pipes.splice(i, 1);
                    state.pipesCount -= 1;
                    if (state.pipesCount === 1) state.pipes = state.pipes[0];
                    dest.emit("unpipe", this);
                    return this
                };
                Readable.prototype.on = function(ev, fn) {
                    var res = Stream.prototype.on.call(this, ev, fn);
                    if (ev === "data" && !this._readableState.flowing) emitDataEvents(this);
                    if (ev === "readable" && this.readable) {
                        var state = this._readableState;
                        if (!state.readableListening) {
                            state.readableListening = true;
                            state.emittedReadable = false;
                            state.needReadable = true;
                            if (!state.reading) {
                                this.read(0)
                            } else if (state.length) {
                                emitReadable(this, state)
                            }
                        }
                    }
                    return res
                };
                Readable.prototype.addListener = Readable.prototype.on;
                Readable.prototype.resume = function() {
                    emitDataEvents(this);
                    this.read(0);
                    this.emit("resume")
                };
                Readable.prototype.pause = function() {
                    emitDataEvents(this, true);
                    this.emit("pause")
                };

                function emitDataEvents(stream, startPaused) {
                    var state = stream._readableState;
                    if (state.flowing) {
                        throw new Error("Cannot switch to old mode now.")
                    }
                    var paused = startPaused || false;
                    var readable = false;
                    stream.readable = true;
                    stream.pipe = Stream.prototype.pipe;
                    stream.on = stream.addListener = Stream.prototype.on;
                    stream.on("readable", function() {
                        readable = true;
                        var c;
                        while (!paused && null !== (c = stream.read())) stream.emit("data", c);
                        if (c === null) {
                            readable = false;
                            stream._readableState.needReadable = true
                        }
                    });
                    stream.pause = function() {
                        paused = true;
                        this.emit("pause")
                    };
                    stream.resume = function() {
                        paused = false;
                        if (readable) process.nextTick(function() {
                            stream.emit("readable")
                        });
                        else this.read(0);
                        this.emit("resume")
                    };
                    stream.emit("readable")
                }
                Readable.prototype.wrap = function(stream) {
                    var state = this._readableState;
                    var paused = false;
                    var self = this;
                    stream.on("end", function() {
                        if (state.decoder && !state.ended) {
                            var chunk = state.decoder.end();
                            if (chunk && chunk.length) self.push(chunk)
                        }
                        self.push(null)
                    });
                    stream.on("data", function(chunk) {
                        if (state.decoder) chunk = state.decoder.write(chunk);
                        if (state.objectMode && (chunk === null || chunk === undefined)) return;
                        else if (!state.objectMode && (!chunk || !chunk.length)) return;
                        var ret = self.push(chunk);
                        if (!ret) {
                            paused = true;
                            stream.pause()
                        }
                    });
                    for (var i in stream) {
                        if (typeof stream[i] === "function" && typeof this[i] === "undefined") {
                            this[i] = function(method) {
                                return function() {
                                    return stream[method].apply(stream, arguments)
                                }
                            }(i)
                        }
                    }
                    var events = ["error", "close", "destroy", "pause", "resume"];
                    forEach(events, function(ev) {
                        stream.on(ev, self.emit.bind(self, ev))
                    });
                    self._read = function(n) {
                        if (paused) {
                            paused = false;
                            stream.resume()
                        }
                    };
                    return self
                };
                Readable._fromList = fromList;

                function fromList(n, state) {
                    var list = state.buffer;
                    var length = state.length;
                    var stringMode = !!state.decoder;
                    var objectMode = !!state.objectMode;
                    var ret;
                    if (list.length === 0) return null;
                    if (length === 0) ret = null;
                    else if (objectMode) ret = list.shift();
                    else if (!n || n >= length) {
                        if (stringMode) ret = list.join("");
                        else ret = Buffer.concat(list, length);
                        list.length = 0
                    } else {
                        if (n < list[0].length) {
                            var buf = list[0];
                            ret = buf.slice(0, n);
                            list[0] = buf.slice(n)
                        } else if (n === list[0].length) {
                            ret = list.shift()
                        } else {
                            if (stringMode) ret = "";
                            else ret = new Buffer(n);
                            var c = 0;
                            for (var i = 0, l = list.length; i < l && c < n; i++) {
                                var buf = list[0];
                                var cpy = Math.min(n - c, buf.length);
                                if (stringMode) ret += buf.slice(0, cpy);
                                else buf.copy(ret, c, 0, cpy);
                                if (cpy < buf.length) list[0] = buf.slice(cpy);
                                else list.shift();
                                c += cpy
                            }
                        }
                    }
                    return ret
                }

                function endReadable(stream) {
                    var state = stream._readableState;
                    if (state.length > 0) throw new Error("endReadable called on non-empty stream");
                    if (!state.endEmitted && state.calledRead) {
                        state.ended = true;
                        process.nextTick(function() {
                            if (!state.endEmitted && state.length === 0) {
                                state.endEmitted = true;
                                stream.readable = false;
                                stream.emit("end")
                            }
                        })
                    }
                }

                function forEach(xs, f) {
                    for (var i = 0, l = xs.length; i < l; i++) {
                        f(xs[i], i)
                    }
                }

                function indexOf(xs, x) {
                    for (var i = 0, l = xs.length; i < l; i++) {
                        if (xs[i] === x) return i
                    }
                    return -1
                }
            }).call(this, require("_process"))
        }, {
            _process: 10,
            buffer: 3,
            "core-util-is": 52,
            events: 7,
            inherits: 39,
            isarray: 53,
            stream: 26,
            "string_decoder/": 54
        }],
        50: [function(require, module, exports) {
            module.exports = Transform;
            var Duplex = require("./_stream_duplex");
            var util = require("core-util-is");
            util.inherits = require("inherits");
            util.inherits(Transform, Duplex);

            function TransformState(options, stream) {
                this.afterTransform = function(er, data) {
                    return afterTransform(stream, er, data)
                };
                this.needTransform = false;
                this.transforming = false;
                this.writecb = null;
                this.writechunk = null
            }

            function afterTransform(stream, er, data) {
                var ts = stream._transformState;
                ts.transforming = false;
                var cb = ts.writecb;
                if (!cb) return stream.emit("error", new Error("no writecb in Transform class"));
                ts.writechunk = null;
                ts.writecb = null;
                if (data !== null && data !== undefined) stream.push(data);
                if (cb) cb(er);
                var rs = stream._readableState;
                rs.reading = false;
                if (rs.needReadable || rs.length < rs.highWaterMark) {
                    stream._read(rs.highWaterMark)
                }
            }

            function Transform(options) {
                if (!(this instanceof Transform)) return new Transform(options);
                Duplex.call(this, options);
                var ts = this._transformState = new TransformState(options, this);
                var stream = this;
                this._readableState.needReadable = true;
                this._readableState.sync = false;
                this.once("finish", function() {
                    if ("function" === typeof this._flush) this._flush(function(er) {
                        done(stream, er)
                    });
                    else done(stream)
                })
            }
            Transform.prototype.push = function(chunk, encoding) {
                this._transformState.needTransform = false;
                return Duplex.prototype.push.call(this, chunk, encoding)
            };
            Transform.prototype._transform = function(chunk, encoding, cb) {
                throw new Error("not implemented")
            };
            Transform.prototype._write = function(chunk, encoding, cb) {
                var ts = this._transformState;
                ts.writecb = cb;
                ts.writechunk = chunk;
                ts.writeencoding = encoding;
                if (!ts.transforming) {
                    var rs = this._readableState;
                    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark)
                }
            };
            Transform.prototype._read = function(n) {
                var ts = this._transformState;
                if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
                    ts.transforming = true;
                    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform)
                } else {
                    ts.needTransform = true
                }
            };

            function done(stream, er) {
                if (er) return stream.emit("error", er);
                var ws = stream._writableState;
                var rs = stream._readableState;
                var ts = stream._transformState;
                if (ws.length) throw new Error("calling transform done when ws.length != 0");
                if (ts.transforming) throw new Error("calling transform done when still transforming");
                return stream.push(null)
            }
        }, {
            "./_stream_duplex": 47,
            "core-util-is": 52,
            inherits: 39
        }],
        51: [function(require, module, exports) {
            (function(process) {
                module.exports = Writable;
                var Buffer = require("buffer").Buffer;
                Writable.WritableState = WritableState;
                var util = require("core-util-is");
                util.inherits = require("inherits");
                var Stream = require("stream");
                util.inherits(Writable, Stream);

                function WriteReq(chunk, encoding, cb) {
                    this.chunk = chunk;
                    this.encoding = encoding;
                    this.callback = cb
                }

                function WritableState(options, stream) {
                    options = options || {};
                    var hwm = options.highWaterMark;
                    this.highWaterMark = hwm || hwm === 0 ? hwm : 16 * 1024;
                    this.objectMode = !!options.objectMode;
                    this.highWaterMark = ~~this.highWaterMark;
                    this.needDrain = false;
                    this.ending = false;
                    this.ended = false;
                    this.finished = false;
                    var noDecode = options.decodeStrings === false;
                    this.decodeStrings = !noDecode;
                    this.defaultEncoding = options.defaultEncoding || "utf8";
                    this.length = 0;
                    this.writing = false;
                    this.sync = true;
                    this.bufferProcessing = false;
                    this.onwrite = function(er) {
                        onwrite(stream, er)
                    };
                    this.writecb = null;
                    this.writelen = 0;
                    this.buffer = [];
                    this.errorEmitted = false
                }

                function Writable(options) {
                    var Duplex = require("./_stream_duplex");
                    if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);
                    this._writableState = new WritableState(options, this);
                    this.writable = true;
                    Stream.call(this)
                }
                Writable.prototype.pipe = function() {
                    this.emit("error", new Error("Cannot pipe. Not readable."))
                };

                function writeAfterEnd(stream, state, cb) {
                    var er = new Error("write after end");
                    stream.emit("error", er);
                    process.nextTick(function() {
                        cb(er)
                    })
                }

                function validChunk(stream, state, chunk, cb) {
                    var valid = true;
                    if (!Buffer.isBuffer(chunk) && "string" !== typeof chunk && chunk !== null && chunk !== undefined && !state.objectMode) {
                        var er = new TypeError("Invalid non-string/buffer chunk");
                        stream.emit("error", er);
                        process.nextTick(function() {
                            cb(er)
                        });
                        valid = false
                    }
                    return valid
                }
                Writable.prototype.write = function(chunk, encoding, cb) {
                    var state = this._writableState;
                    var ret = false;
                    if (typeof encoding === "function") {
                        cb = encoding;
                        encoding = null
                    }
                    if (Buffer.isBuffer(chunk)) encoding = "buffer";
                    else if (!encoding) encoding = state.defaultEncoding;
                    if (typeof cb !== "function") cb = function() {};
                    if (state.ended) writeAfterEnd(this, state, cb);
                    else if (validChunk(this, state, chunk, cb)) ret = writeOrBuffer(this, state, chunk, encoding, cb);
                    return ret
                };

                function decodeChunk(state, chunk, encoding) {
                    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
                        chunk = new Buffer(chunk, encoding)
                    }
                    return chunk
                }

                function writeOrBuffer(stream, state, chunk, encoding, cb) {
                    chunk = decodeChunk(state, chunk, encoding);
                    if (Buffer.isBuffer(chunk)) encoding = "buffer";
                    var len = state.objectMode ? 1 : chunk.length;
                    state.length += len;
                    var ret = state.length < state.highWaterMark;
                    if (!ret) state.needDrain = true;
                    if (state.writing) state.buffer.push(new WriteReq(chunk, encoding, cb));
                    else doWrite(stream, state, len, chunk, encoding, cb);
                    return ret
                }

                function doWrite(stream, state, len, chunk, encoding, cb) {
                    state.writelen = len;
                    state.writecb = cb;
                    state.writing = true;
                    state.sync = true;
                    stream._write(chunk, encoding, state.onwrite);
                    state.sync = false
                }

                function onwriteError(stream, state, sync, er, cb) {
                    if (sync) process.nextTick(function() {
                        cb(er)
                    });
                    else cb(er);
                    stream._writableState.errorEmitted = true;
                    stream.emit("error", er)
                }

                function onwriteStateUpdate(state) {
                    state.writing = false;
                    state.writecb = null;
                    state.length -= state.writelen;
                    state.writelen = 0
                }

                function onwrite(stream, er) {
                    var state = stream._writableState;
                    var sync = state.sync;
                    var cb = state.writecb;
                    onwriteStateUpdate(state);
                    if (er) onwriteError(stream, state, sync, er, cb);
                    else {
                        var finished = needFinish(stream, state);
                        if (!finished && !state.bufferProcessing && state.buffer.length) clearBuffer(stream, state);
                        if (sync) {
                            process.nextTick(function() {
                                afterWrite(stream, state, finished, cb)
                            })
                        } else {
                            afterWrite(stream, state, finished, cb)
                        }
                    }
                }

                function afterWrite(stream, state, finished, cb) {
                    if (!finished) onwriteDrain(stream, state);
                    cb();
                    if (finished) finishMaybe(stream, state)
                }

                function onwriteDrain(stream, state) {
                    if (state.length === 0 && state.needDrain) {
                        state.needDrain = false;
                        stream.emit("drain")
                    }
                }

                function clearBuffer(stream, state) {
                    state.bufferProcessing = true;
                    for (var c = 0; c < state.buffer.length; c++) {
                        var entry = state.buffer[c];
                        var chunk = entry.chunk;
                        var encoding = entry.encoding;
                        var cb = entry.callback;
                        var len = state.objectMode ? 1 : chunk.length;
                        doWrite(stream, state, len, chunk, encoding, cb);
                        if (state.writing) {
                            c++;
                            break
                        }
                    }
                    state.bufferProcessing = false;
                    if (c < state.buffer.length) state.buffer = state.buffer.slice(c);
                    else state.buffer.length = 0
                }
                Writable.prototype._write = function(chunk, encoding, cb) {
                    cb(new Error("not implemented"))
                };
                Writable.prototype.end = function(chunk, encoding, cb) {
                    var state = this._writableState;
                    if (typeof chunk === "function") {
                        cb = chunk;
                        chunk = null;
                        encoding = null
                    } else if (typeof encoding === "function") {
                        cb = encoding;
                        encoding = null
                    }
                    if (typeof chunk !== "undefined" && chunk !== null) this.write(chunk, encoding);
                    if (!state.ending && !state.finished) endWritable(this, state, cb)
                };

                function needFinish(stream, state) {
                    return state.ending && state.length === 0 && !state.finished && !state.writing
                }

                function finishMaybe(stream, state) {
                    var need = needFinish(stream, state);
                    if (need) {
                        state.finished = true;
                        stream.emit("finish")
                    }
                    return need
                }

                function endWritable(stream, state, cb) {
                    state.ending = true;
                    finishMaybe(stream, state);
                    if (cb) {
                        if (state.finished) process.nextTick(cb);
                        else stream.once("finish", cb)
                    }
                    state.ended = true
                }
            }).call(this, require("_process"))
        }, {
            "./_stream_duplex": 47,
            _process: 10,
            buffer: 3,
            "core-util-is": 52,
            inherits: 39,
            stream: 26
        }],
        52: [function(require, module, exports) {
            arguments[4][21][0].apply(exports, arguments)
        }, {
            buffer: 3,
            dup: 21
        }],
        53: [function(require, module, exports) {
            arguments[4][9][0].apply(exports, arguments)
        }, {
            dup: 9
        }],
        54: [function(require, module, exports) {
            arguments[4][27][0].apply(exports, arguments)
        }, {
            buffer: 3,
            dup: 27
        }],
        55: [function(require, module, exports) {
            var Stream = require("stream");
            exports = module.exports = require("./lib/_stream_readable.js");
            exports.Stream = Stream;
            exports.Readable = exports;
            exports.Writable = require("./lib/_stream_writable.js");
            exports.Duplex = require("./lib/_stream_duplex.js");
            exports.Transform = require("./lib/_stream_transform.js");
            exports.PassThrough = require("./lib/_stream_passthrough.js")
        }, {
            "./lib/_stream_duplex.js": 47,
            "./lib/_stream_passthrough.js": 48,
            "./lib/_stream_readable.js": 49,
            "./lib/_stream_transform.js": 50,
            "./lib/_stream_writable.js": 51,
            stream: 26
        }],
        56: [function(require, module, exports) {
            arguments[4][24][0].apply(exports, arguments)
        }, {
            "./lib/_stream_transform.js": 50,
            dup: 24
        }],
        57: [function(require, module, exports) {
            (function(process, Buffer) {
                var stream = require("readable-stream");
                var eos = require("end-of-stream");
                var util = require("util");
                var SIGNAL_FLUSH = new Buffer([0]);
                var onuncork = function(self, fn) {
                    if (self._corked) self.once("uncork", fn);
                    else fn()
                };
                var destroyer = function(self, end) {
                    return function(err) {
                        if (err) self.destroy(err.message === "premature close" ? null : err);
                        else if (end && !self._ended) self.end()
                    }
                };
                var end = function(ws, fn) {
                    if (!ws) return fn();
                    if (ws._writableState && ws._writableState.finished) return fn();
                    if (ws._writableState) return ws.end(fn);
                    ws.end();
                    fn()
                };
                var toStreams2 = function(rs) {
                    return new stream.Readable({
                        objectMode: true,
                        highWaterMark: 16
                    }).wrap(rs)
                };
                var Duplexify = function(writable, readable, opts) {
                    if (!(this instanceof Duplexify)) return new Duplexify(writable, readable, opts);
                    stream.Duplex.call(this, opts);
                    this._writable = null;
                    this._readable = null;
                    this._readable2 = null;
                    this._forwardDestroy = !opts || opts.destroy !== false;
                    this._forwardEnd = !opts || opts.end !== false;
                    this._corked = 1;
                    this._ondrain = null;
                    this._drained = false;
                    this._forwarding = false;
                    this._unwrite = null;
                    this._unread = null;
                    this._ended = false;
                    this.destroyed = false;
                    if (writable) this.setWritable(writable);
                    if (readable) this.setReadable(readable)
                };
                util.inherits(Duplexify, stream.Duplex);
                Duplexify.obj = function(writable, readable, opts) {
                    if (!opts) opts = {};
                    opts.objectMode = true;
                    opts.highWaterMark = 16;
                    return new Duplexify(writable, readable, opts)
                };
                Duplexify.prototype.cork = function() {
                    if (++this._corked === 1) this.emit("cork")
                };
                Duplexify.prototype.uncork = function() {
                    if (this._corked && --this._corked === 0) this.emit("uncork")
                };
                Duplexify.prototype.setWritable = function(writable) {
                    if (this._unwrite) this._unwrite();
                    if (this.destroyed) {
                        if (writable && writable.destroy) writable.destroy();
                        return
                    }
                    if (writable === null || writable === false) {
                        this.end();
                        return
                    }
                    var self = this;
                    var unend = eos(writable, {
                        writable: true,
                        readable: false
                    }, destroyer(this, this._forwardEnd));
                    var ondrain = function() {
                        var ondrain = self._ondrain;
                        self._ondrain = null;
                        if (ondrain) ondrain()
                    };
                    var clear = function() {
                        self._writable.removeListener("drain", ondrain);
                        unend()
                    };
                    if (this._unwrite) process.nextTick(ondrain);
                    this._writable = writable;
                    this._writable.on("drain", ondrain);
                    this._unwrite = clear;
                    this.uncork()
                };
                Duplexify.prototype.setReadable = function(readable) {
                    if (this._unread) this._unread();
                    if (this.destroyed) {
                        if (readable && readable.destroy) readable.destroy();
                        return
                    }
                    if (readable === null || readable === false) {
                        this.push(null);
                        this.resume();
                        return
                    }
                    var self = this;
                    var unend = eos(readable, {
                        writable: false,
                        readable: true
                    }, destroyer(this));
                    var onreadable = function() {
                        self._forward()
                    };
                    var onend = function() {
                        self.push(null)
                    };
                    var clear = function() {
                        self._readable2.removeListener("readable", onreadable);
                        self._readable2.removeListener("end", onend);
                        unend()
                    };
                    this._drained = true;
                    this._readable = readable;
                    this._readable2 = readable._readableState ? readable : toStreams2(readable);
                    this._readable2.on("readable", onreadable);
                    this._readable2.on("end", onend);
                    this._unread = clear;
                    this._forward()
                };
                Duplexify.prototype._read = function() {
                    this._drained = true;
                    this._forward()
                };
                Duplexify.prototype._forward = function() {
                    if (this._forwarding || !this._readable2 || !this._drained) return;
                    this._forwarding = true;
                    var data;
                    var state = this._readable2._readableState;
                    while ((data = this._readable2.read(state.buffer.length ? state.buffer[0].length : state.length)) !== null) {
                        this._drained = this.push(data)
                    }
                    this._forwarding = false
                };
                Duplexify.prototype.destroy = function(err) {
                    if (this.destroyed) return;
                    this.destroyed = true;
                    var self = this;
                    process.nextTick(function() {
                        self._destroy(err)
                    })
                };
                Duplexify.prototype._destroy = function(err) {
                    if (err) {
                        var ondrain = this._ondrain;
                        this._ondrain = null;
                        if (ondrain) ondrain(err);
                        else this.emit("error", err)
                    }
                    if (this._forwardDestroy) {
                        if (this._readable && this._readable.destroy) this._readable.destroy();
                        if (this._writable && this._writable.destroy) this._writable.destroy()
                    }
                    this.emit("close")
                };
                Duplexify.prototype._write = function(data, enc, cb) {
                    if (this.destroyed) return cb();
                    if (this._corked) return onuncork(this, this._write.bind(this, data, enc, cb));
                    if (data === SIGNAL_FLUSH) return this._finish(cb);
                    if (!this._writable) return cb();
                    if (this._writable.write(data) === false) this._ondrain = cb;
                    else cb()
                };
                Duplexify.prototype._finish = function(cb) {
                    var self = this;
                    this.emit("preend");
                    onuncork(this, function() {
                        end(self._forwardEnd && self._writable, function() {
                            if (self._writableState.prefinished === false) self._writableState.prefinished = true;
                            self.emit("prefinish");
                            onuncork(self, cb)
                        })
                    })
                };
                Duplexify.prototype.end = function(data, enc, cb) {
                    if (typeof data === "function") return this.end(null, null, data);
                    if (typeof enc === "function") return this.end(data, null, enc);
                    this._ended = true;
                    if (data) this.write(data);
                    if (!this._writableState.ending) this.write(SIGNAL_FLUSH);
                    return stream.Writable.prototype.end.call(this, cb)
                };
                module.exports = Duplexify
            }).call(this, require("_process"), require("buffer").Buffer)
        }, {
            _process: 10,
            buffer: 3,
            "end-of-stream": 58,
            "readable-stream": 71,
            util: 30
        }],
        58: [function(require, module, exports) {
            var once = require("once");
            var noop = function() {};
            var isRequest = function(stream) {
                return stream.setHeader && typeof stream.abort === "function"
            };
            var eos = function(stream, opts, callback) {
                if (typeof opts === "function") return eos(stream, null, opts);
                if (!opts) opts = {};
                callback = once(callback || noop);
                var ws = stream._writableState;
                var rs = stream._readableState;
                var readable = opts.readable || opts.readable !== false && stream.readable;
                var writable = opts.writable || opts.writable !== false && stream.writable;
                var onlegacyfinish = function() {
                    if (!stream.writable) onfinish()
                };
                var onfinish = function() {
                    writable = false;
                    if (!readable) callback()
                };
                var onend = function() {
                    readable = false;
                    if (!writable) callback()
                };
                var onclose = function() {
                    if (readable && !(rs && rs.ended)) return callback(new Error("premature close"));
                    if (writable && !(ws && ws.ended)) return callback(new Error("premature close"))
                };
                var onrequest = function() {
                    stream.req.on("finish", onfinish)
                };
                if (isRequest(stream)) {
                    stream.on("complete", onfinish);
                    stream.on("abort", onclose);
                    if (stream.req) onrequest();
                    else stream.on("request", onrequest)
                } else if (writable && !ws) {
                    stream.on("end", onlegacyfinish);
                    stream.on("close", onlegacyfinish)
                }
                stream.on("end", onend);
                stream.on("finish", onfinish);
                if (opts.error !== false) stream.on("error", callback);
                stream.on("close", onclose);
                return function() {
                    stream.removeListener("complete", onfinish);
                    stream.removeListener("abort", onclose);
                    stream.removeListener("request", onrequest);
                    if (stream.req) stream.req.removeListener("finish", onfinish);
                    stream.removeListener("end", onlegacyfinish);
                    stream.removeListener("close", onlegacyfinish);
                    stream.removeListener("finish", onfinish);
                    stream.removeListener("end", onend);
                    stream.removeListener("error", callback);
                    stream.removeListener("close", onclose)
                }
            };
            module.exports = eos
        }, {
            once: 60
        }],
        59: [function(require, module, exports) {
            arguments[4][37][0].apply(exports, arguments)
        }, {
            dup: 37
        }],
        60: [function(require, module, exports) {
            arguments[4][38][0].apply(exports, arguments)
        }, {
            dup: 38,
            wrappy: 59
        }],
        61: [function(require, module, exports) {
            "use strict";
            module.exports = Duplex;
            var processNextTick = require("process-nextick-args");
            var objectKeys = Object.keys || function(obj) {
                var keys = [];
                for (var key in obj) keys.push(key);
                return keys
            };
            var util = require("core-util-is");
            util.inherits = require("inherits");
            var Readable = require("./_stream_readable");
            var Writable = require("./_stream_writable");
            util.inherits(Duplex, Readable);
            var keys = objectKeys(Writable.prototype);
            for (var v = 0; v < keys.length; v++) {
                var method = keys[v];
                if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method]
            }

            function Duplex(options) {
                if (!(this instanceof Duplex)) return new Duplex(options);
                Readable.call(this, options);
                Writable.call(this, options);
                if (options && options.readable === false) this.readable = false;
                if (options && options.writable === false) this.writable = false;
                this.allowHalfOpen = true;
                if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;
                this.once("end", onend)
            }

            function onend() {
                if (this.allowHalfOpen || this._writableState.ended) return;
                processNextTick(onEndNT, this)
            }

            function onEndNT(self) {
                self.end()
            }

            function forEach(xs, f) {
                for (var i = 0, l = xs.length; i < l; i++) {
                    f(xs[i], i)
                }
            }
        }, {
            "./_stream_readable": 63,
            "./_stream_writable": 65,
            "core-util-is": 66,
            inherits: 39,
            "process-nextick-args": 68
        }],
        62: [function(require, module, exports) {
            "use strict";
            module.exports = PassThrough;
            var Transform = require("./_stream_transform");
            var util = require("core-util-is");
            util.inherits = require("inherits");
            util.inherits(PassThrough, Transform);

            function PassThrough(options) {
                if (!(this instanceof PassThrough)) return new PassThrough(options);
                Transform.call(this, options)
            }
            PassThrough.prototype._transform = function(chunk, encoding, cb) {
                cb(null, chunk)
            }
        }, {
            "./_stream_transform": 64,
            "core-util-is": 66,
            inherits: 39
        }],
        63: [function(require, module, exports) {
            (function(process) {
                "use strict";
                module.exports = Readable;
                var processNextTick = require("process-nextick-args");
                var isArray = require("isarray");
                var Buffer = require("buffer").Buffer;
                Readable.ReadableState = ReadableState;
                var EE = require("events").EventEmitter;
                if (!EE.listenerCount) EE.listenerCount = function(emitter, type) {
                    return emitter.listeners(type).length
                };
                var Stream;
                (function() {
                    try {
                        Stream = require("st" + "ream")
                    } catch (_) {
                        Stream = require("events").EventEmitter
                    }
                })();
                var util = require("core-util-is");
                util.inherits = require("inherits");
                var debug = require("util");
                if (debug && debug.debuglog) {
                    debug = debug.debuglog("stream")
                } else {
                    debug = function() {}
                }
                var StringDecoder;
                util.inherits(Readable, Stream);

                function ReadableState(options, stream) {
                    var Duplex = require("./_stream_duplex");
                    options = options || {};
                    this.objectMode = !!options.objectMode;
                    if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
                    var hwm = options.highWaterMark;
                    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
                    this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
                    this.highWaterMark = ~~this.highWaterMark;
                    this.buffer = [];
                    this.length = 0;
                    this.pipes = null;
                    this.pipesCount = 0;
                    this.flowing = null;
                    this.ended = false;
                    this.endEmitted = false;
                    this.reading = false;
                    this.sync = true;
                    this.needReadable = false;
                    this.emittedReadable = false;
                    this.readableListening = false;
                    this.defaultEncoding = options.defaultEncoding || "utf8";
                    this.ranOut = false;
                    this.awaitDrain = 0;
                    this.readingMore = false;
                    this.decoder = null;
                    this.encoding = null;
                    if (options.encoding) {
                        if (!StringDecoder) StringDecoder = require("string_decoder/").StringDecoder;
                        this.decoder = new StringDecoder(options.encoding);
                        this.encoding = options.encoding
                    }
                }

                function Readable(options) {
                    var Duplex = require("./_stream_duplex");
                    if (!(this instanceof Readable)) return new Readable(options);
                    this._readableState = new ReadableState(options, this);
                    this.readable = true;
                    if (options && typeof options.read === "function") this._read = options.read;
                    Stream.call(this)
                }
                Readable.prototype.push = function(chunk, encoding) {
                    var state = this._readableState;
                    if (!state.objectMode && typeof chunk === "string") {
                        encoding = encoding || state.defaultEncoding;
                        if (encoding !== state.encoding) {
                            chunk = new Buffer(chunk, encoding);
                            encoding = ""
                        }
                    }
                    return readableAddChunk(this, state, chunk, encoding, false)
                };
                Readable.prototype.unshift = function(chunk) {
                    var state = this._readableState;
                    return readableAddChunk(this, state, chunk, "", true)
                };
                Readable.prototype.isPaused = function() {
                    return this._readableState.flowing === false
                };

                function readableAddChunk(stream, state, chunk, encoding, addToFront) {
                    var er = chunkInvalid(state, chunk);
                    if (er) {
                        stream.emit("error", er)
                    } else if (chunk === null) {
                        state.reading = false;
                        onEofChunk(stream, state)
                    } else if (state.objectMode || chunk && chunk.length > 0) {
                        if (state.ended && !addToFront) {
                            var e = new Error("stream.push() after EOF");
                            stream.emit("error", e)
                        } else if (state.endEmitted && addToFront) {
                            var e = new Error("stream.unshift() after end event");
                            stream.emit("error", e)
                        } else {
                            if (state.decoder && !addToFront && !encoding) chunk = state.decoder.write(chunk);
                            if (!addToFront) state.reading = false;
                            if (state.flowing && state.length === 0 && !state.sync) {
                                stream.emit("data", chunk);
                                stream.read(0)
                            } else {
                                state.length += state.objectMode ? 1 : chunk.length;
                                if (addToFront) state.buffer.unshift(chunk);
                                else state.buffer.push(chunk);
                                if (state.needReadable) emitReadable(stream)
                            }
                            maybeReadMore(stream, state)
                        }
                    } else if (!addToFront) {
                        state.reading = false
                    }
                    return needMoreData(state)
                }

                function needMoreData(state) {
                    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0)
                }
                Readable.prototype.setEncoding = function(enc) {
                    if (!StringDecoder) StringDecoder = require("string_decoder/").StringDecoder;
                    this._readableState.decoder = new StringDecoder(enc);
                    this._readableState.encoding = enc;
                    return this
                };
                var MAX_HWM = 8388608;

                function roundUpToNextPowerOf2(n) {
                    if (n >= MAX_HWM) {
                        n = MAX_HWM
                    } else {
                        n--;
                        for (var p = 1; p < 32; p <<= 1) n |= n >> p;
                        n++
                    }
                    return n
                }

                function howMuchToRead(n, state) {
                    if (state.length === 0 && state.ended) return 0;
                    if (state.objectMode) return n === 0 ? 0 : 1;
                    if (n === null || isNaN(n)) {
                        if (state.flowing && state.buffer.length) return state.buffer[0].length;
                        else return state.length
                    }
                    if (n <= 0) return 0;
                    if (n > state.highWaterMark) state.highWaterMark = roundUpToNextPowerOf2(n);
                    if (n > state.length) {
                        if (!state.ended) {
                            state.needReadable = true;
                            return 0
                        } else {
                            return state.length
                        }
                    }
                    return n
                }
                Readable.prototype.read = function(n) {
                    debug("read", n);
                    var state = this._readableState;
                    var nOrig = n;
                    if (typeof n !== "number" || n > 0) state.emittedReadable = false;
                    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
                        debug("read: emitReadable", state.length, state.ended);
                        if (state.length === 0 && state.ended) endReadable(this);
                        else emitReadable(this);
                        return null
                    }
                    n = howMuchToRead(n, state);
                    if (n === 0 && state.ended) {
                        if (state.length === 0) endReadable(this);
                        return null
                    }
                    var doRead = state.needReadable;
                    debug("need readable", doRead);
                    if (state.length === 0 || state.length - n < state.highWaterMark) {
                        doRead = true;
                        debug("length less than watermark", doRead)
                    }
                    if (state.ended || state.reading) {
                        doRead = false;
                        debug("reading or ended", doRead)
                    }
                    if (doRead) {
                        debug("do read");
                        state.reading = true;
                        state.sync = true;
                        if (state.length === 0) state.needReadable = true;
                        this._read(state.highWaterMark);
                        state.sync = false
                    }
                    if (doRead && !state.reading) n = howMuchToRead(nOrig, state);
                    var ret;
                    if (n > 0) ret = fromList(n, state);
                    else ret = null;
                    if (ret === null) {
                        state.needReadable = true;
                        n = 0
                    }
                    state.length -= n;
                    if (state.length === 0 && !state.ended) state.needReadable = true;
                    if (nOrig !== n && state.ended && state.length === 0) endReadable(this);
                    if (ret !== null) this.emit("data", ret);
                    return ret
                };

                function chunkInvalid(state, chunk) {
                    var er = null;
                    if (!Buffer.isBuffer(chunk) && typeof chunk !== "string" && chunk !== null && chunk !== undefined && !state.objectMode) {
                        er = new TypeError("Invalid non-string/buffer chunk")
                    }
                    return er
                }

                function onEofChunk(stream, state) {
                    if (state.ended) return;
                    if (state.decoder) {
                        var chunk = state.decoder.end();
                        if (chunk && chunk.length) {
                            state.buffer.push(chunk);
                            state.length += state.objectMode ? 1 : chunk.length
                        }
                    }
                    state.ended = true;
                    emitReadable(stream)
                }

                function emitReadable(stream) {
                    var state = stream._readableState;
                    state.needReadable = false;
                    if (!state.emittedReadable) {
                        debug("emitReadable", state.flowing);
                        state.emittedReadable = true;
                        if (state.sync) processNextTick(emitReadable_, stream);
                        else emitReadable_(stream)
                    }
                }

                function emitReadable_(stream) {
                    debug("emit readable");
                    stream.emit("readable");
                    flow(stream)
                }

                function maybeReadMore(stream, state) {
                    if (!state.readingMore) {
                        state.readingMore = true;
                        processNextTick(maybeReadMore_, stream, state)
                    }
                }

                function maybeReadMore_(stream, state) {
                    var len = state.length;
                    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
                        debug("maybeReadMore read 0");
                        stream.read(0);
                        if (len === state.length) break;
                        else len = state.length
                    }
                    state.readingMore = false
                }
                Readable.prototype._read = function(n) {
                    this.emit("error", new Error("not implemented"))
                };
                Readable.prototype.pipe = function(dest, pipeOpts) {
                    var src = this;
                    var state = this._readableState;
                    switch (state.pipesCount) {
                        case 0:
                            state.pipes = dest;
                            break;
                        case 1:
                            state.pipes = [state.pipes, dest];
                            break;
                        default:
                            state.pipes.push(dest);
                            break
                    }
                    state.pipesCount += 1;
                    debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
                    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
                    var endFn = doEnd ? onend : cleanup;
                    if (state.endEmitted) processNextTick(endFn);
                    else src.once("end", endFn);
                    dest.on("unpipe", onunpipe);

                    function onunpipe(readable) {
                        debug("onunpipe");
                        if (readable === src) {
                            cleanup()
                        }
                    }

                    function onend() {
                        debug("onend");
                        dest.end()
                    }
                    var ondrain = pipeOnDrain(src);
                    dest.on("drain", ondrain);

                    function cleanup() {
                        debug("cleanup");
                        dest.removeListener("close", onclose);
                        dest.removeListener("finish", onfinish);
                        dest.removeListener("drain", ondrain);
                        dest.removeListener("error", onerror);
                        dest.removeListener("unpipe", onunpipe);
                        src.removeListener("end", onend);
                        src.removeListener("end", cleanup);
                        src.removeListener("data", ondata);
                        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain()
                    }
                    src.on("data", ondata);

                    function ondata(chunk) {
                        debug("ondata");
                        var ret = dest.write(chunk);
                        if (false === ret) {
                            debug("false write response, pause", src._readableState.awaitDrain);
                            src._readableState.awaitDrain++;
                            src.pause()
                        }
                    }

                    function onerror(er) {
                        debug("onerror", er);
                        unpipe();
                        dest.removeListener("error", onerror);
                        if (EE.listenerCount(dest, "error") === 0) dest.emit("error", er)
                    }
                    if (!dest._events || !dest._events.error) dest.on("error", onerror);
                    else if (isArray(dest._events.error)) dest._events.error.unshift(onerror);
                    else dest._events.error = [onerror, dest._events.error];

                    function onclose() {
                        dest.removeListener("finish", onfinish);
                        unpipe()
                    }
                    dest.once("close", onclose);

                    function onfinish() {
                        debug("onfinish");
                        dest.removeListener("close", onclose);
                        unpipe()
                    }
                    dest.once("finish", onfinish);

                    function unpipe() {
                        debug("unpipe");
                        src.unpipe(dest)
                    }
                    dest.emit("pipe", src);
                    if (!state.flowing) {
                        debug("pipe resume");
                        src.resume()
                    }
                    return dest
                };

                function pipeOnDrain(src) {
                    return function() {
                        var state = src._readableState;
                        debug("pipeOnDrain", state.awaitDrain);
                        if (state.awaitDrain) state.awaitDrain--;
                        if (state.awaitDrain === 0 && EE.listenerCount(src, "data")) {
                            state.flowing = true;
                            flow(src)
                        }
                    }
                }
                Readable.prototype.unpipe = function(dest) {
                    var state = this._readableState;
                    if (state.pipesCount === 0) return this;
                    if (state.pipesCount === 1) {
                        if (dest && dest !== state.pipes) return this;
                        if (!dest) dest = state.pipes;
                        state.pipes = null;
                        state.pipesCount = 0;
                        state.flowing = false;
                        if (dest) dest.emit("unpipe", this);
                        return this
                    }
                    if (!dest) {
                        var dests = state.pipes;
                        var len = state.pipesCount;
                        state.pipes = null;
                        state.pipesCount = 0;
                        state.flowing = false;
                        for (var i = 0; i < len; i++) dests[i].emit("unpipe", this);
                        return this
                    }
                    var i = indexOf(state.pipes, dest);
                    if (i === -1) return this;
                    state.pipes.splice(i, 1);
                    state.pipesCount -= 1;
                    if (state.pipesCount === 1) state.pipes = state.pipes[0];
                    dest.emit("unpipe", this);
                    return this
                };
                Readable.prototype.on = function(ev, fn) {
                    var res = Stream.prototype.on.call(this, ev, fn);
                    if (ev === "data" && false !== this._readableState.flowing) {
                        this.resume()
                    }
                    if (ev === "readable" && this.readable) {
                        var state = this._readableState;
                        if (!state.readableListening) {
                            state.readableListening = true;
                            state.emittedReadable = false;
                            state.needReadable = true;
                            if (!state.reading) {
                                processNextTick(nReadingNextTick, this)
                            } else if (state.length) {
                                emitReadable(this, state)
                            }
                        }
                    }
                    return res
                };
                Readable.prototype.addListener = Readable.prototype.on;

                function nReadingNextTick(self) {
                    debug("readable nexttick read 0");
                    self.read(0)
                }
                Readable.prototype.resume = function() {
                    var state = this._readableState;
                    if (!state.flowing) {
                        debug("resume");
                        state.flowing = true;
                        resume(this, state)
                    }
                    return this
                };

                function resume(stream, state) {
                    if (!state.resumeScheduled) {
                        state.resumeScheduled = true;
                        processNextTick(resume_, stream, state)
                    }
                }

                function resume_(stream, state) {
                    if (!state.reading) {
                        debug("resume read 0");
                        stream.read(0)
                    }
                    state.resumeScheduled = false;
                    stream.emit("resume");
                    flow(stream);
                    if (state.flowing && !state.reading) stream.read(0)
                }
                Readable.prototype.pause = function() {
                    debug("call pause flowing=%j", this._readableState.flowing);
                    if (false !== this._readableState.flowing) {
                        debug("pause");
                        this._readableState.flowing = false;
                        this.emit("pause")
                    }
                    return this
                };

                function flow(stream) {
                    var state = stream._readableState;
                    debug("flow", state.flowing);
                    if (state.flowing) {
                        do {
                            var chunk = stream.read()
                        } while (null !== chunk && state.flowing)
                    }
                }
                Readable.prototype.wrap = function(stream) {
                    var state = this._readableState;
                    var paused = false;
                    var self = this;
                    stream.on("end", function() {
                        debug("wrapped end");
                        if (state.decoder && !state.ended) {
                            var chunk = state.decoder.end();
                            if (chunk && chunk.length) self.push(chunk)
                        }
                        self.push(null)
                    });
                    stream.on("data", function(chunk) {
                        debug("wrapped data");
                        if (state.decoder) chunk = state.decoder.write(chunk);
                        if (state.objectMode && (chunk === null || chunk === undefined)) return;
                        else if (!state.objectMode && (!chunk || !chunk.length)) return;
                        var ret = self.push(chunk);
                        if (!ret) {
                            paused = true;
                            stream.pause()
                        }
                    });
                    for (var i in stream) {
                        if (this[i] === undefined && typeof stream[i] === "function") {
                            this[i] = function(method) {
                                return function() {
                                    return stream[method].apply(stream, arguments)
                                }
                            }(i)
                        }
                    }
                    var events = ["error", "close", "destroy", "pause", "resume"];
                    forEach(events, function(ev) {
                        stream.on(ev, self.emit.bind(self, ev))
                    });
                    self._read = function(n) {
                        debug("wrapped _read", n);
                        if (paused) {
                            paused = false;
                            stream.resume()
                        }
                    };
                    return self
                };
                Readable._fromList = fromList;

                function fromList(n, state) {
                    var list = state.buffer;
                    var length = state.length;
                    var stringMode = !!state.decoder;
                    var objectMode = !!state.objectMode;
                    var ret;
                    if (list.length === 0) return null;
                    if (length === 0) ret = null;
                    else if (objectMode) ret = list.shift();
                    else if (!n || n >= length) {
                        if (stringMode) ret = list.join("");
                        else ret = Buffer.concat(list, length);
                        list.length = 0
                    } else {
                        if (n < list[0].length) {
                            var buf = list[0];
                            ret = buf.slice(0, n);
                            list[0] = buf.slice(n)
                        } else if (n === list[0].length) {
                            ret = list.shift()
                        } else {
                            if (stringMode) ret = "";
                            else ret = new Buffer(n);
                            var c = 0;
                            for (var i = 0, l = list.length; i < l && c < n; i++) {
                                var buf = list[0];
                                var cpy = Math.min(n - c, buf.length);
                                if (stringMode) ret += buf.slice(0, cpy);
                                else buf.copy(ret, c, 0, cpy);
                                if (cpy < buf.length) list[0] = buf.slice(cpy);
                                else list.shift();
                                c += cpy
                            }
                        }
                    }
                    return ret
                }

                function endReadable(stream) {
                    var state = stream._readableState;
                    if (state.length > 0) throw new Error("endReadable called on non-empty stream");
                    if (!state.endEmitted) {
                        state.ended = true;
                        processNextTick(endReadableNT, state, stream)
                    }
                }

                function endReadableNT(state, stream) {
                    if (!state.endEmitted && state.length === 0) {
                        state.endEmitted = true;
                        stream.readable = false;
                        stream.emit("end")
                    }
                }

                function forEach(xs, f) {
                    for (var i = 0, l = xs.length; i < l; i++) {
                        f(xs[i], i)
                    }
                }

                function indexOf(xs, x) {
                    for (var i = 0, l = xs.length; i < l; i++) {
                        if (xs[i] === x) return i
                    }
                    return -1
                }
            }).call(this, require("_process"))
        }, {
            "./_stream_duplex": 61,
            _process: 10,
            buffer: 3,
            "core-util-is": 66,
            events: 7,
            inherits: 39,
            isarray: 67,
            "process-nextick-args": 68,
            "string_decoder/": 69,
            util: 2
        }],
        64: [function(require, module, exports) {
            "use strict";
            module.exports = Transform;
            var Duplex = require("./_stream_duplex");
            var util = require("core-util-is");
            util.inherits = require("inherits");
            util.inherits(Transform, Duplex);

            function TransformState(stream) {
                this.afterTransform = function(er, data) {
                    return afterTransform(stream, er, data)
                };
                this.needTransform = false;
                this.transforming = false;
                this.writecb = null;
                this.writechunk = null
            }

            function afterTransform(stream, er, data) {
                var ts = stream._transformState;
                ts.transforming = false;
                var cb = ts.writecb;
                if (!cb) return stream.emit("error", new Error("no writecb in Transform class"));
                ts.writechunk = null;
                ts.writecb = null;
                if (data !== null && data !== undefined) stream.push(data);
                if (cb) cb(er);
                var rs = stream._readableState;
                rs.reading = false;
                if (rs.needReadable || rs.length < rs.highWaterMark) {
                    stream._read(rs.highWaterMark)
                }
            }

            function Transform(options) {
                if (!(this instanceof Transform)) return new Transform(options);
                Duplex.call(this, options);
                this._transformState = new TransformState(this);
                var stream = this;
                this._readableState.needReadable = true;
                this._readableState.sync = false;
                if (options) {
                    if (typeof options.transform === "function") this._transform = options.transform;
                    if (typeof options.flush === "function") this._flush = options.flush
                }
                this.once("prefinish", function() {
                    if (typeof this._flush === "function") this._flush(function(er) {
                        done(stream, er)
                    });
                    else done(stream)
                })
            }
            Transform.prototype.push = function(chunk, encoding) {
                this._transformState.needTransform = false;
                return Duplex.prototype.push.call(this, chunk, encoding)
            };
            Transform.prototype._transform = function(chunk, encoding, cb) {
                throw new Error("not implemented")
            };
            Transform.prototype._write = function(chunk, encoding, cb) {
                var ts = this._transformState;
                ts.writecb = cb;
                ts.writechunk = chunk;
                ts.writeencoding = encoding;
                if (!ts.transforming) {
                    var rs = this._readableState;
                    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark)
                }
            };
            Transform.prototype._read = function(n) {
                var ts = this._transformState;
                if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
                    ts.transforming = true;
                    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform)
                } else {
                    ts.needTransform = true
                }
            };

            function done(stream, er) {
                if (er) return stream.emit("error", er);
                var ws = stream._writableState;
                var ts = stream._transformState;
                if (ws.length) throw new Error("calling transform done when ws.length != 0");
                if (ts.transforming) throw new Error("calling transform done when still transforming");
                return stream.push(null)
            }
        }, {
            "./_stream_duplex": 61,
            "core-util-is": 66,
            inherits: 39
        }],
        65: [function(require, module, exports) {
            "use strict";
            module.exports = Writable;
            var processNextTick = require("process-nextick-args");
            var Buffer = require("buffer").Buffer;
            Writable.WritableState = WritableState;
            var util = require("core-util-is");
            util.inherits = require("inherits");
            var Stream;
            (function() {
                try {
                    Stream = require("st" + "ream")
                } catch (_) {
                    Stream = require("events").EventEmitter
                }
            })();
            util.inherits(Writable, Stream);

            function nop() {}

            function WriteReq(chunk, encoding, cb) {
                this.chunk = chunk;
                this.encoding = encoding;
                this.callback = cb;
                this.next = null
            }

            function WritableState(options, stream) {
                var Duplex = require("./_stream_duplex");
                options = options || {};
                this.objectMode = !!options.objectMode;
                if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
                var hwm = options.highWaterMark;
                var defaultHwm = this.objectMode ? 16 : 16 * 1024;
                this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;
                this.highWaterMark = ~~this.highWaterMark;
                this.needDrain = false;
                this.ending = false;
                this.ended = false;
                this.finished = false;
                var noDecode = options.decodeStrings === false;
                this.decodeStrings = !noDecode;
                this.defaultEncoding = options.defaultEncoding || "utf8";
                this.length = 0;
                this.writing = false;
                this.corked = 0;
                this.sync = true;
                this.bufferProcessing = false;
                this.onwrite = function(er) {
                    onwrite(stream, er)
                };
                this.writecb = null;
                this.writelen = 0;
                this.bufferedRequest = null;
                this.lastBufferedRequest = null;
                this.pendingcb = 0;
                this.prefinished = false;
                this.errorEmitted = false
            }
            WritableState.prototype.getBuffer = function writableStateGetBuffer() {
                var current = this.bufferedRequest;
                var out = [];
                while (current) {
                    out.push(current);
                    current = current.next
                }
                return out
            };
            Object.defineProperty(WritableState.prototype, "buffer", {
                get: require("util-deprecate")(function() {
                    return this.getBuffer()
                }, "_writableState.buffer is deprecated. Use " + "_writableState.getBuffer() instead.")
            });

            function Writable(options) {
                var Duplex = require("./_stream_duplex");
                if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);
                this._writableState = new WritableState(options, this);
                this.writable = true;
                if (options) {
                    if (typeof options.write === "function") this._write = options.write;
                    if (typeof options.writev === "function") this._writev = options.writev
                }
                Stream.call(this)
            }
            Writable.prototype.pipe = function() {
                this.emit("error", new Error("Cannot pipe. Not readable."))
            };

            function writeAfterEnd(stream, cb) {
                var er = new Error("write after end");
                stream.emit("error", er);
                processNextTick(cb, er)
            }

            function validChunk(stream, state, chunk, cb) {
                var valid = true;
                if (!Buffer.isBuffer(chunk) && typeof chunk !== "string" && chunk !== null && chunk !== undefined && !state.objectMode) {
                    var er = new TypeError("Invalid non-string/buffer chunk");
                    stream.emit("error", er);
                    processNextTick(cb, er);
                    valid = false
                }
                return valid
            }
            Writable.prototype.write = function(chunk, encoding, cb) {
                var state = this._writableState;
                var ret = false;
                if (typeof encoding === "function") {
                    cb = encoding;
                    encoding = null
                }
                if (chunk instanceof Buffer) encoding = "buffer";
                else if (!encoding) encoding = state.defaultEncoding;
                if (typeof cb !== "function") cb = nop;
                if (state.ended) writeAfterEnd(this, cb);
                else if (validChunk(this, state, chunk, cb)) {
                    state.pendingcb++;
                    ret = writeOrBuffer(this, state, chunk, encoding, cb)
                }
                return ret
            };
            Writable.prototype.cork = function() {
                var state = this._writableState;
                state.corked++
            };
            Writable.prototype.uncork = function() {
                var state = this._writableState;
                if (state.corked) {
                    state.corked--;
                    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state)
                }
            };
            Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
                if (typeof encoding === "string") encoding = encoding.toLowerCase();
                if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + encoding);
                this._writableState.defaultEncoding = encoding
            };

            function decodeChunk(state, chunk, encoding) {
                if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
                    chunk = new Buffer(chunk, encoding)
                }
                return chunk
            }

            function writeOrBuffer(stream, state, chunk, encoding, cb) {
                chunk = decodeChunk(state, chunk, encoding);
                if (chunk instanceof Buffer) encoding = "buffer";
                var len = state.objectMode ? 1 : chunk.length;
                state.length += len;
                var ret = state.length < state.highWaterMark;
                if (!ret) state.needDrain = true;
                if (state.writing || state.corked) {
                    var last = state.lastBufferedRequest;
                    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
                    if (last) {
                        last.next = state.lastBufferedRequest
                    } else {
                        state.bufferedRequest = state.lastBufferedRequest
                    }
                } else {
                    doWrite(stream, state, false, len, chunk, encoding, cb)
                }
                return ret
            }

            function doWrite(stream, state, writev, len, chunk, encoding, cb) {
                state.writelen = len;
                state.writecb = cb;
                state.writing = true;
                state.sync = true;
                if (writev) stream._writev(chunk, state.onwrite);
                else stream._write(chunk, encoding, state.onwrite);
                state.sync = false
            }

            function onwriteError(stream, state, sync, er, cb) {
                --state.pendingcb;
                if (sync) processNextTick(cb, er);
                else cb(er);
                stream._writableState.errorEmitted = true;
                stream.emit("error", er)
            }

            function onwriteStateUpdate(state) {
                state.writing = false;
                state.writecb = null;
                state.length -= state.writelen;
                state.writelen = 0
            }

            function onwrite(stream, er) {
                var state = stream._writableState;
                var sync = state.sync;
                var cb = state.writecb;
                onwriteStateUpdate(state);
                if (er) onwriteError(stream, state, sync, er, cb);
                else {
                    var finished = needFinish(state);
                    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
                        clearBuffer(stream, state)
                    }
                    if (sync) {
                        processNextTick(afterWrite, stream, state, finished, cb)
                    } else {
                        afterWrite(stream, state, finished, cb)
                    }
                }
            }

            function afterWrite(stream, state, finished, cb) {
                if (!finished) onwriteDrain(stream, state);
                state.pendingcb--;
                cb();
                finishMaybe(stream, state)
            }

            function onwriteDrain(stream, state) {
                if (state.length === 0 && state.needDrain) {
                    state.needDrain = false;
                    stream.emit("drain")
                }
            }

            function clearBuffer(stream, state) {
                state.bufferProcessing = true;
                var entry = state.bufferedRequest;
                if (stream._writev && entry && entry.next) {
                    var buffer = [];
                    var cbs = [];
                    while (entry) {
                        cbs.push(entry.callback);
                        buffer.push(entry);
                        entry = entry.next
                    }
                    state.pendingcb++;
                    state.lastBufferedRequest = null;
                    doWrite(stream, state, true, state.length, buffer, "", function(err) {
                        for (var i = 0; i < cbs.length; i++) {
                            state.pendingcb--;
                            cbs[i](err)
                        }
                    })
                } else {
                    while (entry) {
                        var chunk = entry.chunk;
                        var encoding = entry.encoding;
                        var cb = entry.callback;
                        var len = state.objectMode ? 1 : chunk.length;
                        doWrite(stream, state, false, len, chunk, encoding, cb);
                        entry = entry.next;
                        if (state.writing) {
                            break
                        }
                    }
                    if (entry === null) state.lastBufferedRequest = null
                }
                state.bufferedRequest = entry;
                state.bufferProcessing = false
            }
            Writable.prototype._write = function(chunk, encoding, cb) {
                cb(new Error("not implemented"))
            };
            Writable.prototype._writev = null;
            Writable.prototype.end = function(chunk, encoding, cb) {
                var state = this._writableState;
                if (typeof chunk === "function") {
                    cb = chunk;
                    chunk = null;
                    encoding = null
                } else if (typeof encoding === "function") {
                    cb = encoding;
                    encoding = null
                }
                if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);
                if (state.corked) {
                    state.corked = 1;
                    this.uncork()
                }
                if (!state.ending && !state.finished) endWritable(this, state, cb)
            };

            function needFinish(state) {
                return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing
            }

            function prefinish(stream, state) {
                if (!state.prefinished) {
                    state.prefinished = true;
                    stream.emit("prefinish")
                }
            }

            function finishMaybe(stream, state) {
                var need = needFinish(state);
                if (need) {
                    if (state.pendingcb === 0) {
                        prefinish(stream, state);
                        state.finished = true;
                        stream.emit("finish")
                    } else {
                        prefinish(stream, state)
                    }
                }
                return need
            }

            function endWritable(stream, state, cb) {
                state.ending = true;
                finishMaybe(stream, state);
                if (cb) {
                    if (state.finished) processNextTick(cb);
                    else stream.once("finish", cb)
                }
                state.ended = true
            }
        }, {
            "./_stream_duplex": 61,
            buffer: 3,
            "core-util-is": 66,
            events: 7,
            inherits: 39,
            "process-nextick-args": 68,
            "util-deprecate": 70
        }],
        66: [function(require, module, exports) {
            arguments[4][21][0].apply(exports, arguments)
        }, {
            buffer: 3,
            dup: 21
        }],
        67: [function(require, module, exports) {
            arguments[4][9][0].apply(exports, arguments)
        }, {
            dup: 9
        }],
        68: [function(require, module, exports) {
            (function(process) {
                "use strict";
                module.exports = nextTick;

                function nextTick(fn) {
                    var args = new Array(arguments.length - 1);
                    var i = 0;
                    while (i < arguments.length) {
                        args[i++] = arguments[i]
                    }
                    process.nextTick(function afterTick() {
                        fn.apply(null, args)
                    })
                }
            }).call(this, require("_process"))
        }, {
            _process: 10
        }],
        69: [function(require, module, exports) {
            arguments[4][27][0].apply(exports, arguments)
        }, {
            buffer: 3,
            dup: 27
        }],
        70: [function(require, module, exports) {
            (function(global) {
                module.exports = deprecate;

                function deprecate(fn, msg) {
                    if (config("noDeprecation")) {
                        return fn
                    }
                    var warned = false;

                    function deprecated() {
                        if (!warned) {
                            if (config("throwDeprecation")) {
                                throw new Error(msg)
                            } else if (config("traceDeprecation")) {
                                console.trace(msg)
                            } else {
                                console.warn(msg)
                            }
                            warned = true
                        }
                        return fn.apply(this, arguments)
                    }
                    return deprecated
                }

                function config(name) {
                    if (!global.localStorage) return false;
                    var val = global.localStorage[name];
                    if (null == val) return false;
                    return String(val).toLowerCase() === "true"
                }
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {}],
        71: [function(require, module, exports) {
            (function() {
                try {
                    exports.Stream = require("st" + "ream")
                } catch (_) {}
            })();
            exports = module.exports = require("./lib/_stream_readable.js");
            exports.Readable = exports;
            exports.Writable = require("./lib/_stream_writable.js");
            exports.Duplex = require("./lib/_stream_duplex.js");
            exports.Transform = require("./lib/_stream_transform.js");
            exports.PassThrough = require("./lib/_stream_passthrough.js")
        }, {
            "./lib/_stream_duplex.js": 61,
            "./lib/_stream_passthrough.js": 62,
            "./lib/_stream_readable.js": 63,
            "./lib/_stream_transform.js": 64,
            "./lib/_stream_writable.js": 65
        }],
        72: [function(require, module, exports) {
            (function(process) {
                var Transform = require("readable-stream/transform"),
                    inherits = require("util").inherits,
                    xtend = require("xtend");

                function DestroyableTransform(opts) {
                    Transform.call(this, opts);
                    this._destroyed = false
                }
                inherits(DestroyableTransform, Transform);
                DestroyableTransform.prototype.destroy = function(err) {
                    if (this._destroyed) return;
                    this._destroyed = true;
                    var self = this;
                    process.nextTick(function() {
                        if (err) self.emit("error", err);
                        self.emit("close")
                    })
                };

                function noop(chunk, enc, callback) {
                    callback(null, chunk)
                }

                function through2(construct) {
                    return function(options, transform, flush) {
                        if (typeof options == "function") {
                            flush = transform;
                            transform = options;
                            options = {}
                        }
                        if (typeof transform != "function") transform = noop;
                        if (typeof flush != "function") flush = null;
                        return construct(options, transform, flush)
                    }
                }
                module.exports = through2(function(options, transform, flush) {
                    var t2 = new DestroyableTransform(options);
                    t2._transform = transform;
                    if (flush) t2._flush = flush;
                    return t2
                });
                module.exports.ctor = through2(function(options, transform, flush) {
                    function Through2(override) {
                        if (!(this instanceof Through2)) return new Through2(override);
                        this.options = xtend(options, override);
                        DestroyableTransform.call(this, this.options)
                    }
                    inherits(Through2, DestroyableTransform);
                    Through2.prototype._transform = transform;
                    if (flush) Through2.prototype._flush = flush;
                    return Through2
                });
                module.exports.obj = through2(function(options, transform, flush) {
                    var t2 = new DestroyableTransform(xtend({
                        objectMode: true,
                        highWaterMark: 16
                    }, options));
                    t2._transform = transform;
                    if (flush) t2._flush = flush;
                    return t2
                })
            }).call(this, require("_process"))
        }, {
            _process: 10,
            "readable-stream/transform": 56,
            util: 30,
            xtend: 75
        }],
        73: [function(require, module, exports) {
            var global = function() {
                return this
            }();
            var WebSocket = global.WebSocket || global.MozWebSocket;
            module.exports = WebSocket ? ws : null;

            function ws(uri, protocols, opts) {
                var instance;
                if (protocols) {
                    instance = new WebSocket(uri, protocols)
                } else {
                    instance = new WebSocket(uri)
                }
                return instance
            }
            if (WebSocket) ws.prototype = WebSocket.prototype
        }, {}],
        74: [function(require, module, exports) {
            (function(process, Buffer) {
                var through = require("through2");
                var duplexify = require("duplexify");
                var WS = require("ws");
                module.exports = WebSocketStream;

                function WebSocketStream(target, protocols) {
                    var stream, socket;
                    var socketWrite = process.title === "browser" ? socketWriteBrowser : socketWriteNode;
                    var proxy = through(socketWrite, socketEnd);
                    if (typeof target === "object") {
                        socket = target
                    } else {
                        socket = new WS(target, protocols);
                        socket.binaryType = "arraybuffer";
                    }
                    if (socket.readyState === 1) {
                        stream = proxy
                    } else {
                        stream = duplexify();
                        socket.addEventListener("open", onready)
                    }
                    stream.socket = socket;
                    socket.addEventListener("close", onclose);
                    socket.addEventListener("error", onerror);
                    socket.addEventListener("message", onmessage);
                    proxy.on("close", destroy);

                    function socketWriteNode(chunk, enc, next) {
                        socket.send(chunk, next)
                    }

                    function socketWriteBrowser(chunk, enc, next) {
                        try {
                            socket.send(chunk)
                        } catch (err) {
                            return next(err)
                        }
                        next()
                    }

                    function socketEnd(done) {
                        socket.close();
                        done()
                    }

                    function onready() {
                        stream.setReadable(proxy);
                        stream.setWritable(proxy);
                        stream.emit("connect")
                    }

                    function onclose() {
                        stream.end();
                        stream.destroy()
                    }

                    function onerror(err) {
                        stream.destroy(err)
                    }

                    function onmessage(event) {
                        var data = event.data;
                        if (data instanceof ArrayBuffer) data = new Buffer(new Uint8Array(data));
                        proxy.push(data)
                    }

                    function destroy() {
                        socket.close()
                    }
                    return stream
                }
            }).call(this, require("_process"), require("buffer").Buffer)
        }, {
            _process: 10,
            buffer: 3,
            duplexify: 57,
            through2: 72,
            ws: 73
        }],
        75: [function(require, module, exports) {
            module.exports = extend;

            function extend() {
                var target = {};
                for (var i = 0; i < arguments.length; i++) {
                    var source = arguments[i];
                    for (var key in source) {
                        if (source.hasOwnProperty(key)) {
                            target[key] = source[key]
                        }
                    }
                }
                return target
            }
        }, {}],
        mqtt: [function(require, module, exports) {
            (function(process) {
                "use strict";
                var MqttClient = require("../client"),
                    url = require("url"),
                    xtend = require("xtend"),
                    protocols = {},
                    protocolList = [];
                if ("browser" !== process.title) {
                    protocols.mqtt = require("./tcp");
                    protocols.tcp = require("./tcp");
                    protocols.ssl = require("./tls");
                    protocols.tls = require("./tls");
                    protocols.mqtts = require("./tls")
                }
                protocols.ws = require("./ws");
                protocols.wss = require("./ws");
                protocolList = ["mqtt", "mqtts", "ws", "wss"];

                function parseAuthOptions(opts) {
                    var matches;
                    if (opts.auth) {
                        matches = opts.auth.match(/^(.+):(.+)$/);
                        if (matches) {
                            opts.username = matches[1];
                            opts.password = matches[2]
                        } else {
                            opts.username = opts.auth
                        }
                    }
                }

                function connect(brokerUrl, opts) {
                    if ("object" === typeof brokerUrl && !opts) {
                        opts = brokerUrl;
                        brokerUrl = null
                    }
                    opts = opts || {};
                    if (brokerUrl) {
                        opts = xtend(url.parse(brokerUrl, true), opts);
                        opts.protocol = opts.protocol.replace(/\:$/, "")
                    }
                    parseAuthOptions(opts);
                    if (opts.query && "string" === typeof opts.query.clientId) {
                        opts.clientId = opts.query.clientId
                    }
                    if (opts.cert && opts.key) {
                        if (opts.protocol) {
                            if (-1 === ["mqtts", "wss"].indexOf(opts.protocol)) {
                                switch (opts.protocol) {
                                    case "mqtt":
                                        opts.protocol = "mqtts";
                                        break;
                                    case "ws":
                                        opts.protocol = "wss";
                                        break;
                                    default:
                                        throw new Error('Unknown protocol for secure conenction: "' + opts.protocol + '"!');
                                        break
                                }
                            }
                        } else {
                            throw new Error("Missing secure protocol key")
                        }
                    }
                    if (!protocols[opts.protocol]) {
                        opts.protocol = protocolList.filter(function(key) {
                            return "function" === typeof protocols[key]
                        })[0]
                    }
                    if (false === opts.clean && !opts.clientId) {
                        throw new Error("Missing clientId for unclean clients")
                    }

                    function wrapper(client) {
                        if (opts.servers) {
                            if (!client._reconnectCount || client._reconnectCount === opts.servers.length) {
                                client._reconnectCount = 0
                            }
                            opts.host = opts.servers[client._reconnectCount].host;
                            opts.port = opts.servers[client._reconnectCount].port;
                            client._reconnectCount++
                        }
                        return protocols[opts.protocol](client, opts)
                    }
                    return new MqttClient(wrapper, opts)
                }
                module.exports = connect;
                module.exports.connect = connect
            }).call(this, require("_process"))
        }, {
            "../client": 31,
            "./tcp": 32,
            "./tls": 33,
            "./ws": 34,
            _process: 10,
            url: 28,
            xtend: 75
        }]
    }, {}, [])("mqtt")
});
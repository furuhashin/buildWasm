export class Buffer {
    #cursor = 0 // プライベートフィールド
    #buffer: ArrayBuffer

    constructor({buffer}:{buffer:ArrayBuffer}) { // buffer:ArrayBufferではだめ？
        this.#buffer = buffer
    }

    readBytes(size:number): Uint8Array {
        if (this.#buffer.byteLength < this.#cursor+size) {
            return new Uint8Array(0)
        }

        const slice = this.#buffer.slice(this.#cursor, this.#cursor+size)
        this.#cursor += size
        return new Uint8Array(slice)
    }

    readByte(): number {
        const bytes = this.readBytes(1) // [0x00,0x61,0x73,0x6d]を１つずつ取得する感じ １バイト(8ビット)取得 0x00 = 00000000
        if (bytes.length <= 0) {
            return -1
        }
        return bytes[0] //Uint8Arrayの最初に255までの8桁のビットが入っている（Uint8arrayは８ビットごとに値を格納する）
    }

     readU32(): number{
        let result = 0;
        let shift = 0;
        while (true) {
            const byte = this.readByte()
            result |= (byte & 0b01111111) << shift; // 下位から７ビット取り出して、shift分ずらしてビット論理和を代入
            shift += 7; //
            if ((0b10000000 & byte) === 0) {
                return result;
            }
        }
    }

    readS32(): number {
        let result = 0;
        let shift = 0;

        while(true) {
            const byte = this.readByte()
            result |= (byte & 0b01111111) << shift;
            shift += 7;
            if ((0b10000000 & byte) === 0) {
                if (shift < 32 && (byte & 0b01000000) != 0) {
                    return result | (~0 << shift);
                }
                return result;
            }
        }
    }

    readI32(): number {
        return this.readS32()
    }

    readBuffer(size:number=this.#buffer.byteLength-this.#cursor): Buffer {
        return new Buffer(this.readBytes(size))
    }

    readVec<T>(readT: ()=>T): T[] {
        const vec = []
        const size = this.readU32()
        for (let i = 0; i < size; i++) {
            vec.push(readT());
        }
        return vec;
    }

    get byteLength(): number {
        return this.#buffer.byteLength
    }

    get eof(): boolean {
        return this.byteLength <= this.#cursor
    }
}
import {Buffer} from "./buffer.ts"

export class ModuleNode {
    magic?: Uint8Array
    version?: Uint8Array
    sections: SectionNode[] = []

    load(buffer:Buffer) {
        this.magic = buffer.readBytes(4)
        this.version = buffer.readBytes(4)

        while (true) {
            if (buffer.eof) break

            const section = this.loadSection(buffer)
            this.sections.push(section)
        }
    }

    loadSection(buffer:Buffer): SectionNode {
        const sectionId = buffer.readByte()
        const sectionSize = buffer.readU32()
        const sectionBuffer = buffer.readBuffer(sectionSize)

        const section = SectionNode.create(sectionId)
        section.load(sectionBuffer)
        return section
    }
}

abstract class SectionNode {
    static create(sectionId:number): SectionNode {
        switch (sectionId) {
            case 1:
                return new TypeSectionNode();
            case 3:
                return new FunctionSectionNode();
            case 10:
                return new CodeSectionNode():
            default:
                throw new Error("invalid section id: ${sectionId}");
        }
    }
    abstract load(buffer:Buffer):void
}
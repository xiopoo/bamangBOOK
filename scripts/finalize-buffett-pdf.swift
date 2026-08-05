import Foundation
import PDFKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let ebookDir = root.appendingPathComponent("output/ebook", isDirectory: true)
let outputDir = root.appendingPathComponent("output/pdf", isDirectory: true)
let coverURL = ebookDir.appendingPathComponent(".巴菲特文集_封面临时.pdf")
let bodyURL = ebookDir.appendingPathComponent(".巴菲特文集_正文临时.pdf")
let outputURL = outputDir.appendingPathComponent("巴菲特文集_1956-2025.pdf")

let volumeLabels = [
    "卷01　理解巴菲特：人生、选择与伯克希尔",
    "卷02　起点与方法：早期文章及合伙人信",
    "卷03　资本配置主线：伯克希尔股东信",
    "卷04　原则的现场检验：伯克希尔股东大会",
    "卷05　专题写作：商业、市场与管理备忘录",
    "卷06　公开演讲：投资、职业与人生",
    "卷07　访谈与课堂：在具体问题中思考",
]

guard let cover = PDFDocument(url: coverURL), let body = PDFDocument(url: bodyURL) else {
    fputs("无法打开临时 PDF\n", stderr)
    exit(1)
}

try FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)
let output = PDFDocument()

if let page = cover.page(at: 0)?.copy() as? PDFPage {
    output.insert(page, at: output.pageCount)
}
for index in 0..<body.pageCount {
    autoreleasepool {
        if let page = body.page(at: index)?.copy() as? PDFPage {
            output.insert(page, at: output.pageCount)
        }
    }
}

output.documentAttributes = [
    PDFDocumentAttribute.titleAttribute: "巴菲特文集：精读编排版（1956—2025）",
    PDFDocumentAttribute.authorAttribute: "沃伦·巴菲特等",
    PDFDocumentAttribute.subjectAttribute: "按人物、早期实践、股东信、股东大会、专题写作、演讲与访谈编辑的中文文集",
    PDFDocumentAttribute.creatorAttribute: "巴芒书院资料库精读编排版",
]

let rootOutline = PDFOutline()
let coverOutline = PDFOutline()
coverOutline.label = "封面"
if let page = output.page(at: 0) {
    coverOutline.destination = PDFDestination(page: page, at: CGPoint(x: 0, y: page.bounds(for: .mediaBox).height))
}
rootOutline.insertChild(coverOutline, at: rootOutline.numberOfChildren)

var nextVolume = 0
for bodyIndex in 0..<body.pageCount where nextVolume < volumeLabels.count {
    autoreleasepool {
        guard let text = body.page(at: bodyIndex)?.string else { return }
        let marker = "VOLUME\(String(format: "%02d", nextVolume + 1))"
        if text.replacingOccurrences(of: " ", with: "").contains(marker),
           let page = output.page(at: bodyIndex + 1) {
            let item = PDFOutline()
            item.label = volumeLabels[nextVolume]
            item.destination = PDFDestination(page: page, at: CGPoint(x: 0, y: page.bounds(for: .mediaBox).height))
            rootOutline.insertChild(item, at: rootOutline.numberOfChildren)
            nextVolume += 1
        }
    }
}
output.outlineRoot = rootOutline

guard output.write(to: outputURL) else {
    fputs("写入最终 PDF 失败\n", stderr)
    exit(1)
}

let bytes = (try? FileManager.default.attributesOfItem(atPath: outputURL.path)[.size] as? NSNumber)?.intValue ?? 0
print(["output": outputURL.path, "pages": output.pageCount, "bookmarks": rootOutline.numberOfChildren, "bytes": bytes])

import Foundation
import PDFKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let ebookDir = root.appendingPathComponent("output/ebook", isDirectory: true)
let outputDir = root.appendingPathComponent("output/pdf", isDirectory: true)
let coverURL = ebookDir.appendingPathComponent(".芒格文集_封面临时.pdf")
let bodyURL = ebookDir.appendingPathComponent(".芒格文集_正文临时.pdf")
let outputURL = outputDir.appendingPathComponent("芒格文集_1924-2023.pdf")

let volumeLabels = [
    "卷01　理解芒格：人生、事业与精神坐标",
    "卷02　核心经典：《穷查理宝典》",
    "卷03　实践现场：Wesco 股东大会",
    "卷04　晚年智慧：每日期刊年会",
    "卷05　对话与访谈：在具体问题中思考",
    "卷06　方法论：学习、思考与避免愚蠢",
    "卷07　数量思维：数学、概率与不确定性",
    "卷08　人类误判：心理倾向与叠加效应",
    "卷09　商业世界：经济学、竞争优势与管理",
    "卷10　投资判断：会计、金融与资本配置",
    "卷11　系统世界：科学、工程与复杂性",
    "卷12　长期品格：历史、法律、哲学与自我修炼",
    "卷13　主题索引：语录与复习入口",
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
    PDFDocumentAttribute.titleAttribute: "芒格文集：精读编排版（1924—2023）",
    PDFDocumentAttribute.authorAttribute: "查理·芒格等",
    PDFDocumentAttribute.subjectAttribute: "按人物、经典、实践、模型与复习路径编辑的查理·芒格中文文集",
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

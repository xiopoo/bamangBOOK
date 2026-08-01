// render-ebook-previews.swift — 从两卷终稿 PDF 渲染售卖页「实际页面预览」截图
// 用法：swift scripts/render-ebook-previews.swift
// 说明：另一个对话框改版 PDF 后，重新运行本脚本即可更新 public/ebook-previews/ 下的 6 张图。
import AppKit
import Foundation
import PDFKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let outDir = root.appendingPathComponent("public/ebook-previews", isDirectory: true)
try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let jobs: [(String, String, [Int])] = [
    ("build_books/所有者的眼光_巴菲特卷.pdf", "buffett", [1, 3, 13]),
    ("build_books/理性的格栅_芒格卷.pdf", "munger", [1, 3, 4]),
]

let W: CGFloat = 1100

for (rel, prefix, pages) in jobs {
    let pdfURL = root.appendingPathComponent(rel)
    guard let doc = PDFDocument(url: pdfURL) else { print("OPEN FAIL \(rel)"); continue }
    for pageNo in pages {
        autoreleasepool {
            guard let page = doc.page(at: pageNo - 1) else { return }
            let box = page.bounds(for: .mediaBox)
            let H = W * box.height / box.width
            let image = page.thumbnail(of: NSSize(width: W, height: H), for: .mediaBox)
            guard let tiff = image.tiffRepresentation,
                  let bitmap = NSBitmapImageRep(data: tiff),
                  let png = bitmap.representation(using: .png, properties: [.compressionFactor: 0.85]) else { return }
            let url = outDir.appendingPathComponent("\(prefix)-p\(String(format: "%02d", pageNo)).png")
            try? png.write(to: url)
            if let size = try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int {
                print("\(url.lastPathComponent): \(size / 1024) KB")
            }
        }
    }
}
print("done -> \(outDir.path)")

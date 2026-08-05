import AppKit
import Foundation
import PDFKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let pdfURL = root.appendingPathComponent("output/pdf/巴菲特文集_1956-2025.pdf")
let sampleDir = URL(fileURLWithPath: "/tmp/buffett-pdf-samples", isDirectory: true)

guard let document = PDFDocument(url: pdfURL) else {
    fputs("无法打开 PDF\n", stderr)
    exit(1)
}
try FileManager.default.createDirectory(at: sampleDir, withIntermediateDirectories: true)

var volumePages: [Int] = []
if let outline = document.outlineRoot {
    for childIndex in 1..<outline.numberOfChildren {
        if let page = outline.child(at: childIndex)?.destination?.page {
            volumePages.append(document.index(for: page))
        }
    }
}

let requested = Set([0, 1, 2, 3, document.pageCount - 1] + volumePages + volumePages.map { min($0 + 1, document.pageCount - 1) })
for index in requested.sorted() {
    autoreleasepool {
        guard let page = document.page(at: index) else { return }
        let image = page.thumbnail(of: NSSize(width: 1190, height: 1684), for: .mediaBox)
        guard let tiff = image.tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: tiff),
              let png = bitmap.representation(using: .png, properties: [:]) else { return }
        let url = sampleDir.appendingPathComponent(String(format: "page-%04d.png", index + 1))
        try? png.write(to: url)
    }
}

print(["pages": document.pageCount, "volumePages": volumePages.map { $0 + 1 }, "samples": requested.sorted().map { $0 + 1 }])

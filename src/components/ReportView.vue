<template>
    <div>
        <input type="text" v-model="waterprint_text" />
        <p>*目前僅英文，有方法更改成中文字體(待實踐)</p>
        <hr />
        <button @click="modifyPDF()">show PDF with waterprint</button>
        <hr />
        <button @click="dowloadPDF()">Download PDF</button>

        <div class="pdfarea">
            <!-- PDF area -->
            <div v-show="renderPDF_bool" class="pdfwrap">
                <div class="canvas_wrap">
                    <canvas id="report_content" frameborder="0"></canvas>
                </div>
                <div class="operate_row">
                    <button
                        :class="['arrow_btn', { active: prevActive }]"
                        id="prev"
                        @click="onPrevPage()"
                    ></button>
                    <span>
                        頁數:
                        <span id="page_num">{{ pageNum }}</span>
                        /
                        <span id="page_count">{{ totalPage }}</span>
                    </span>
                    <button
                        :class="['arrow_btn', { active: nextActive }]"
                        id="next"
                        @click="onNextPage()"
                    ></button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";

let DowloadJS = require("downloadjs");

const PDFJS = require("pdfjs-dist");
import "pdfjs-dist/build/pdf.worker.entry";
PDFJS.GlobalWorkerOptions.workerSrc = window.pdfjsWorker;
// import * as PDFJS from 'pdfjs-dist'
// PDFJS.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

export default {
    name: "ReportView",
    data() {
        return {
            blobUrl:
                "https://cashreportpdf.blob.core.windows.net/pdf/AAB0110120221114150757",
            waterprint_text: "waterprint waterprint waterprint",
            pdfBytes: null,
            pageNum: 1,
            totalPage: 1,
            modalStatus: false,
            pageRendering: false,
            pageNumPending: null,
            pdfDoc: null,
            prevActive: false,
            nextActive: false,
            pdfScale: 1,
            renderPDF_bool: false,
        };
    },
    async mounted() {
        // await this.modifyPDF();
        // await this.showPDF(this.pdfBytes);
    },
    methods: {
        async getPDF() {
            await this.axios
                .get(
                    `pdfapi/pdf?blobContainerName=pdf2&blobName=S2210000H1.pdf&watermarkText=測試浮水印`,
                    { responseType: "arraybuffer" }
                )
                .then((res) => {
                    console.log("getPDF", res.data);
                    this.showPDF(res.data);
                })
                .catch((error) => {
                    console.log("error", error);
                });
        },
        async modifyPDF() {
            let existingPdfBytes = await this.axios
                .get(this.blobUrl, { responseType: "blob" })
                .then((res) => {
                    console.log("blobUrl", res);
                    return res.data.arrayBuffer();
                });

            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const helveticaFont = await pdfDoc.embedFont(
                StandardFonts.Helvetica
            );

            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();
            firstPage.drawText(this.waterprint_text, {
                x: 3,
                y: height / 2,
                size: 50,
                font: helveticaFont,
                color: rgb(0.95, 0.1, 0.1),
                rotate: degrees(5),
            });

            this.pdfBytes = await pdfDoc.save();

            console.log("pdfDoc", pdfDoc);
            console.log("pdfBytes", this.pdfBytes);
            // this.pdfBytes = this.pdfBytes
            await this.showPDF(this.pdfBytes);
        },
        async showPDF(pdfData) {
            // await this.modifyPDF();

            let vm = this;

            this.pageNum = 1;
            this.totalPage = 1;
            this.prevActive = false;
            this.nextActive = false;

            PDFJS.disableWorker = true;

            let pdfObj = { data: pdfData };
            let loadingTask = PDFJS.getDocument(pdfObj);

            await loadingTask.promise.then(function (pdfDoc_) {
                //test
                console.log("loadingTask", pdfDoc_);

                vm.pdfDoc = pdfDoc_;
                vm.totalPage = pdfDoc_.numPages;

                vm.renderPage(vm.pageNum);

                if (vm.totalPage > 1) {
                    vm.nextActive = true;
                }
                vm.renderPDF_bool = true;
            });
        },
        async dowloadPDF() {
            // await this.modifyPDF();
            await DowloadJS(
                this.pdfBytes,
                "pdf-lib_example.pdf",
                "application/pdf"
            );
        },
        async renderPage(num) {
            let vm = this;

            this.pageRendering = true;

            await this.pdfDoc.getPage(num).then(function (page) {
                console.log("getPage", page);

                let canvas = document.getElementById("report_content");
                let context = canvas.getContext("2d");
                let viewport = page.getViewport({ scale: vm.pdfScale });

                console.log("viewport", viewport);

                canvas.height = viewport.height;
                canvas.width = viewport.width;
                //預設大小
                // canvas.height = 792;
                // canvas.width = 612;

                let renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                let renderTask = page.render(renderContext);

                renderTask.promise
                    .then(function (res) {
                        console.log("renderTask", res);

                        vm.pageRendering = false;

                        if (vm.pageNumPending !== null) {
                            vm.renderPage(vm.pageNumPending);

                            vm.pageNumPending = null;
                        }
                    })
                    .catch((err) => {
                        console.error("PDFJS.getDocument failed:", err);
                    });
            });
        },
        queueRenderPage(num) {
            if (this.pageRendering) {
                this.pageNumPending = num;
            } else {
                this.renderPage(num);
            }
        },
        onPrevPage() {
            // 上一頁
            if (this.pageNum <= 1) {
                //首頁
                return;
            }

            this.pageNum--;

            this.queueRenderPage(this.pageNum);
        },
        onNextPage() {
            // 下一頁
            if (this.pageNum >= this.totalPage) {
                //尾頁
                return;
            }

            this.pageNum++;

            this.queueRenderPage(this.pageNum);
        },
    },
};
</script>
<style lang="scss" scoped>
button {
    width: 150px;
    height: 60px;
}
.pdfarea {
    padding: 0px;
    max-height: unset;
    background: #f5f5f5;
}
iframe {
    height: 100%;
}
.pdfwrap {
    width: 800px;
    text-align: center;
}
.canvas_wrap {
    overflow-y: auto;
    padding-top: 20px;
}
.operate_row {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 0;
    span {
        font-weight: bold;
        font-size: 20px;
    }
}
button.arrow_btn {
    width: 50px;
    margin: 0 10px;
    padding: 4px 0px;
    background: none;
    border: none;
    cursor: auto;
}
canvas {
    border: 1px solid #000;
}
#page_num {
    color: #000;
}
input {
    line-height: 2;
    width: 350px;
}
</style>

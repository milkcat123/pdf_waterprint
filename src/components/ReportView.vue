<template>
  <div>
    上傳PDF檔案:
    <input
      type="file"
      name="uploiadPdf"
      id="uploiadPdf"
      accept=".pdf"
      @change="getFile($event)"
    />
  </div>
  <div>
    浮水印文字:
    <input type="text" v-model="waterprintText" placeholder="輸入浮水印文字" />
  </div>
  <hr />
  <div>
    <button @click="showPDF()" :disabled="getPending">顯示帶浮水印的PDF</button>
    <div class="pdfarea">
      <p v-show="!renderPDF_bool">預覽位置</p>
      <!-- PDF area -->
      <div v-show="renderPDF_bool" class="pdfwrap">
        <div class="canvas_wrap">
          <canvas id="report_content" frameborder="0"></canvas>
        </div>
        <div class="operate_row">
          <button
            :class="['arrow_btn', { active: prevActive }]"
            :disabled="pageNum <= 1"
            id="prev"
            @click="onPrevPage()"
          >
            <i class="bi bi-caret-left-fill"></i>
          </button>
          <span>
            頁數:
            <span id="page_num">{{ pageNum }}</span>
            /
            <span id="page_count">{{ totalPage }}</span>
          </span>
          <button
            :class="['arrow_btn', { active: nextActive }]"
            :disabled="pageNum >= totalPage"
            id="next"
            @click="onNextPage()"
          >
            <i class="bi bi-caret-right-fill"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
  <hr />
  <div>
    命名此PDF:
    <input type="text" v-model="newPdfName" placeholder="輸入檔案名稱" />
    <br />
    <button @click="dowloadPDF()" :disabled="getPending">下載此PDF</button>
  </div>
</template>
<script>
import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";

let DowloadJS = require("downloadjs");
// const PDFJS = require("pdfjs-dist");
import * as PDFJS from "pdfjs-dist";
PDFJS.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.mjs";
// PDFJS.GlobalWorkerOptions.workerSrc =
//   "//mozilla.github.io/pdf.js/build/pdf.worker.js";

let v_pdfDoc = null;
let v_getFile;

export default {
  name: "ReportView",
  data() {
    return {
      //   pdfUrl: "",
      waterprintText: "waterprint waterprint waterprint",
      newPdfName: "waterprint_sample",
      pdfBytes: null,
      pageNum: 1,
      totalPage: 1,
      modalStatus: false,
      pageRendering: false,
      pageNumPending: null,
      prevActive: false,
      nextActive: false,
      pdfScale: 0.8,
      renderPDF_bool: false,
      getPending: true,
    };
  },
  methods: {
    getFile(e) {
      v_getFile = e.target.files[0];
      this.modifyPDF();
      this.getPending = false;
    },
    getReaderFile() {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => {
          //   console.log("onload", reader.result);
          resolve(reader.result);
        };
        reader.readAsArrayBuffer(v_getFile);
      });
    },
    async modifyPDF() {
      //   let existingPdfBytes = await this.axios
      //     .get(this.pdfUrl, { responseType: "blob" })
      //     .then((res) => {
      //       console.log("pdfUrl", res);
      //       return res.data.arrayBuffer();
      //     });
      const _file = await this.getReaderFile();
      const pdfDoc = await PDFDocument.load(_file);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      firstPage.drawText(this.waterprintText, {
        x: 3,
        y: height / 2,
        size: 50,
        font: helveticaFont,
        color: rgb(0.95, 0.1, 0.1),
        rotate: degrees(5),
      });

      this.pdfBytes = await pdfDoc.save();

      console.log("pdfBytes", this.pdfBytes);
    },
    async showPDF() {
      this.pageNum = 1;
      this.totalPage = 1;
      this.prevActive = false;
      this.nextActive = false;

      let vm = this;
      let pdfObj = { data: this.pdfBytes };
      //   PDFJS.disableWorker = true;

      await PDFJS.getDocument(pdfObj)
        .promise.then(function (pdfDoc_) {
          console.log("getDocument", pdfDoc_);

          v_pdfDoc = pdfDoc_;

          vm.totalPage = pdfDoc_.numPages;
          vm.renderPage(v_pdfDoc, vm.pageNum);

          if (vm.totalPage > 1) {
            vm.nextActive = true;
          }
          vm.renderPDF_bool = true;
        })
        .catch((err) => {
          console.error("pdf get doc", err);
          this.isError = true;
        });
    },
    async dowloadPDF() {
      if (this.newPdfName.length === 0) {
        return;
      }
      await this.modifyPDF();
      await DowloadJS(
        this.pdfBytes,
        `${this.newPdfName}.pdf`,
        "application/pdf"
      );
    },
    async renderPage(pdfDoc, num) {
      let vm = this;

      this.pageRendering = true;

      await pdfDoc
        .getPage(num)
        .then(function (page) {
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
        })
        .catch((err) => {
          this.isError = true;
          console.error("getPage failed:", err);
        });
    },
    queueRenderPage(num) {
      if (this.pageRendering) {
        this.pageNumPending = num;
      } else {
        this.renderPage(v_pdfDoc, num);
      }
    },
    onPrevPage() {
      // 上一頁
      this.pageNum--;
      this.queueRenderPage(this.pageNum);
    },
    onNextPage() {
      // 下一頁
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
  width: 60vw;
  text-align: center;
  min-width: 400px;
  min-height: 150px;
  padding: 0px;
  max-height: unset;
  background: #f5f5f5;
  margin: 20px 0px;
  p {
    text-align: center;
    line-height: 150px;
  }
}
iframe {
  height: 100%;
}
.pdfwrap {
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

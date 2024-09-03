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
  <hr />
  <div>
    文件資訊:
    尺寸: 寬(x):{{original.width}} & 高(y):{{ original.height }}
  </div>
  <div>
    浮水印文字:
    <input type="text" v-model="waterprintText" placeholder="輸入浮水印文字" />
  </div>
  <div>
    文字尺寸:
    <input type="number" v-model="textSize" step="1" min="10" max="120" />
  </div>
  <div>
    文字起始水平位置(x軸):
    <input type="number" v-model="xPosition" step="1" min="0" max="500" />
  </div>
  <div>
    文字垂直位置(y軸):
    <input type="number" v-model="yPosition" step="1" min="0" max="999" />
  </div>
  <div>
    旋轉角度:
    <input type="number" v-model="rotateDegree" step="1" min="-180" max="180" />
  </div>
  <div>
    <button @click="modifyPDF()" :disabled="getPending">
      顯示帶浮水印的PDF
    </button>
    <div class="pdfarea">
      <p v-show="!renderPDF_bool">預覽位置</p>
      <!-- PDF area -->
      <div v-show="renderPDF_bool" class="pdfwrap">
        <iframe frameborder="1" id="pdf"></iframe>
      </div>
    </div>
  </div>
</template>
<script>
import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";
let v_getFile;

export default {
  name: "ReportView",
  data() {
    return {
      waterprintText: "waterprint waterprint waterprint",
      textSize: 50,
      xPosition: 0,
      yPosition: 0,
      rotateDegree: 10,
      original: { width: 0, height: 0 },
      newPdfName: "waterprint_sample",
      pdfBytes: null,
      renderPDF_bool: false,
      getPending: true,
    };
  },
  methods: {
    getFile(e) {
      v_getFile = e.target.files[0];
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
      const _file = await this.getReaderFile();
      const pdfDoc = await PDFDocument.load(_file);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();
      //todo: 增加為每一頁都要同樣的浮水印
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      this.original.width = width;
      this.original.height = height;

      firstPage.drawText(this.waterprintText, {
        x: this.xPosition,
        y: this.yPosition,
        size: this.textSize,
        font: helveticaFont,
        color: rgb(0.95, 0.1, 0.1),
        rotate: degrees(this.rotateDegree),
      });

      this.pdfBytes = await pdfDoc.save();

      const bytes = new Uint8Array(this.pdfBytes);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const docUrl = URL.createObjectURL(blob);
      document.getElementById("pdf").src = docUrl;

      console.log("pdfBytes", this.pdfBytes);
      this.renderPDF_bool = true;
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
  min-width: 425px;
  min-height: 200px;
  padding: 20px;
  max-height: unset;
  background: #f5f5f5;
  margin: 20px 0px;
  p {
    text-align: center;
    line-height: 150px;
  }
}
#pdf {
  width: 100%;
  height: 600px;
}
.canvas_wrap {
  overflow-y: auto;
  padding-top: 20px;
}
input {
  line-height: 2;
  width: 350px;
  &[type="number"]{
    width: 60px;
  }
}
</style>

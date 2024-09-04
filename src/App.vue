<template>
  <div id="app">
    <div class="left_side">
      <h1>PDF浮水印工具</h1>

      <div class="card bg_1">
        <div class="wrap_step">
          <div class="step">1</div>
          <div class="icon">
            <i class="bi bi-file-arrow-up"></i>
          </div>
        </div>
        <div class="card_title">
          <h2>上傳PDF檔案</h2>
          <div class="sub">upload file</div>
        </div>
        <div class="content">
          <input
            type="file"
            name="uploadPdf"
            id="uploadPdf"
            accept=".pdf"
            @change="getFile($event)"
          />
        </div>
      </div>

      <div class="card bg_2">
        <div class="wrap_step">
          <div class="step">2</div>
          <div class="icon">
            <i class="bi bi-clipboard2-data"></i>
          </div>
        </div>
        <div class="card_title">
          <h2>文件資訊</h2>
          <div class="sub">document info</div>
        </div>
        <div class="content">
          <div class="row">
            <span>名稱：</span>
            <span class="display">{{ original.name }}</span>
          </div>
          <div class="row">
            <span>總頁數：</span>
            <span class="display">{{ original.totalPages }}</span>
            <span>寬(x)：</span>
            <span class="display">{{ original.width }}</span>
            <span>高(y)：</span>
            <span class="display">{{ original.height }}</span>
          </div>
        </div>
      </div>

      <div class="card bg_3">
        <div class="wrap_step">
          <div class="step">3</div>
          <div class="icon">
            <i class="bi bi-passport"></i>
          </div>
        </div>
        <div class="card_title">
          <h2>設定浮水印</h2>
          <div class="sub">waterprint setting</div>
        </div>
        <div class="content">
          <div class="row">
            <span>浮水印文字：</span>
            <input
              type="text"
              v-model="waterprintText"
              placeholder="輸入浮水印文字"
              maxlength="100"
            />
          </div>
          <div class="row">
            <span>字體大小：</span>
            <input
              type="number"
              v-model="textSize"
              step="1"
              min="10"
              max="120"
            />
            <span>顏色：</span>
            <input type="color" v-model="pickColor" @change="getColor()" />
            <span>旋轉角度：</span>
            <input
              type="number"
              v-model="rotateDegree"
              step="1"
              min="-180"
              max="180"
            />
          </div>
          <div class="row">
            <span class="bold">起始位置 |</span>
            <span>水平(x軸)：</span>
            <input
              type="number"
              v-model="xPosition"
              step="1"
              min="0"
              :max="original.xMax"
            />
            <span>垂直(y軸)：</span>
            <input
              type="number"
              v-model="yPosition"
              step="1"
              min="0"
              :max="original.yMax"
            />
          </div>
        </div>
      </div>

      <button
        @click="modifyPDF()"
        :disabled="getFileLoading"
        class="render_button"
      >
        預覽加上浮水印的文件
      </button>
    </div>

    <div class="right_side">
      <p v-show="!loadingPdf">預覽位置</p>
      <!-- PDF area -->
      <div v-show="loadingPdf" class="pdfwrap">
        <iframe frameborder="1" ref="pdfView"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";
let v_getFile;

export default {
  name: "App",
  data() {
    return {
      original: {
        name: "test",
        width: 0,
        height: 0,
        color: { r: 1, g: 0, b: 0 },
        totalPages: 0,
        xMax: 10,
        yMax: 10,
      },
      waterprintText: "waterprint waterprint waterprint",
      textSize: 50,
      xPosition: 0,
      yPosition: 0,
      rotateDegree: 10,
      pickColor: "#ff0000",
      pdfBytes: null,
      getFileLoading: true,
      loadingPdf: false,
    };
  },
  methods: {
    async getFile(e) {
      //   console.log("get file", e.target.files);

      v_getFile = e.target.files[0];
      this.original.name = v_getFile.name;

      const _file = await this.getReaderFile();
      const pdfDoc = await PDFDocument.load(_file);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      this.original.width = width;
      this.original.height = height;
      this.original.totalPages = pages.length;
      this.original.xMax = Math.ceil(width);
      this.original.yMax = Math.ceil(height);
        console.log(this.original);
      this.getFileLoading = false;
    },
    getColor() {
      const val = this.pickColor;
      // 改成16進位再除以255
      this.original.color = {
        r: this.transferToRgb(val, 1),
        g: this.transferToRgb(val, 3),
        b: this.transferToRgb(val, 5),
      };
      console.log("get color", this.original.color);
    },
    transferToRgb(n, start) {
      return parseInt(n.substr(start, 2), 16) / 255;
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

      const { r, g, b } = this.original.color;
      const drawOption = {
        x: this.xPosition,
        y: this.yPosition,
        size: this.textSize,
        font: helveticaFont,
        color: rgb(r, g, b),
        rotate: degrees(this.rotateDegree),
      };
      //增加為每一頁都要同樣的浮水印
      pages.forEach((item) => {
        item.drawText(this.waterprintText, drawOption);
      });

      this.pdfBytes = await pdfDoc.save();

      const bytes = new Uint8Array(this.pdfBytes);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const docUrl = URL.createObjectURL(blob);
      this.$refs.pdfView.src = docUrl;

    //   console.log("pdfBytes", this.pdfBytes);
      this.loadingPdf = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./assets/css/variable.scss";
#app {
  display: flex;
  @include portrait {
    flex-direction: column;
  }
}
h1 {
  color: #925e47;
  font-size: 36px;
  font-weight: 900;
  margin-bottom: 6px;
}
.left_side {
  width: 500px;
  height: 100vh;
  overflow-y: auto;
  padding: 30px;
  text-align: center;
  @include portrait {
    width: 100vw;
    height: unset;
    overflow-y: unset;
  }
  .card {
    text-align: left;
    padding: 0px 14px 16px 14px;
    margin: 16px 0px;
    border-radius: 10px;
    box-shadow: #949da421 0px 6px 12px;
    &.bg_1 {
      background: #fff9e8;
    }
    &.bg_2 {
      background: #ffeecf;
    }
    &.bg_3 {
      background: #ffe1b9;
    }
  }
  .content {
    .row {
      display: flex;
      padding: 4px 0px;
      @include portrait {
        flex-wrap: wrap;
      }
      > * {
        color: #636363;
        white-space: nowrap;
        line-height: 1.2;
        border-radius: 4px;
        vertical-align: middle;
      }
      .display {
        display: inline-block;
        width: 100%;
        padding: 2px 4px;
        margin: 0px 12px 0px 4px;
        background: #ffffffa4;
        @include portrait {
          margin: 0px;
        }
      }
      input {
        width: 100%;
        margin: 0px 12px 0px 4px;
        background: #fff;
        @include portrait {
          margin: 0px;
        }
      }
      :nth-last-of-type(1) {
        margin-right: 0px;
      }
      .bold {
        font-weight: bold;
        margin-right: 6px;
      }
    }
  }
}
.wrap_step {
  position: relative;
  display: inline-block;
  width: 105px;
  vertical-align: middle;
  .step {
    text-align: center;
    display: inline-block;
    font-size: 95px;
    color: #ff9e6b;
    opacity: 0.14;
    font-weight: 900;
    font-family: Helvetica, Arial, sans-serif;
  }
  .icon {
    position: absolute;
    top: 25px;
    right: 12px;
    display: inline-block;
    color: #ff884a;
    font-size: 52px;
    opacity: 0.6;
  }
}
.card_title {
  display: inline-block;
  text-align: left;
  vertical-align: middle;
  h2 {
    color: #925e47;
    font-size: 24px;
    text-align: left;
    line-height: 1.5;
  }
  .sub {
    color: #ff884a;
  }
}
.render_button {
  width: 100%;
  color: #fff;
  padding: 16px;
  background: #ff884a;
  border-radius: 99rem;
  box-shadow: #949da421 0px 6px 12px;
  cursor: pointer;
  &:disabled {
    background: #ff894a8f;
  }
}
.right_side {
  width: calc(100vw - 500px);
  height: 100vh;
  min-width: 425px;
  min-height: 400px;
  max-height: unset;
  text-align: center;
  background: #f5f5f5;
  padding: 20px;
  @include portrait {
    width: 100vw;
    height: unset;
  }
  p {
    text-align: center;
    line-height: 150px;
  }
}
.pdfwrap {
  height: 100%;
  iframe {
    width: 100%;
    height: 100%;
  }
  @include portrait {
    height: 500px;
  }
}
input[type="file"] {
  padding: 12px 0px 0px 16px;
  color: #636363;
}
</style>

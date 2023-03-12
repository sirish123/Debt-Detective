import * as vscode from "vscode";
import ReactPanel from "./panel";
import axios from "axios";
import * as fs from "fs";

export let required: { [key: string]: string } = {};

declare module namespace {
  export interface SecurityObject {
    vId: string;
    cVersion: string;
    pkgName: string;
    CVE: string;
    advisory: string;
  }
}

let message = "omk";
async function getDepOfPkg(doc: vscode.TextDocument) {
  const text = doc.getText();

  message = "updating...";

  const textArr: string[] = text.split(/\r\n|\n/);

  const packages: string[] = [];

  for (let i = 0; i < textArr.length; i++) {
    const line = textArr[i];
    if (line.includes("import")) {
      const pkg = line.split(" ")[1];
      packages.push(pkg);
    }
  }

  //shell execution for all packages
  // pipdeptree -p <pkg1> <pkg2> <pkg3> > output.txt

  const shellExec = new vscode.ShellExecution(
    `venv\\Scripts\\activate && pipdeptree -p ${packages.join(
      ","
    )} > output.txt`
  );

  // const shellExec = new vscode.ShellExecution(
  //   `venv\\Scripts\\activate && pipdeptree -p ${packages[0]} > output.txt`
  // );

  message = "updating2...";
  vscode.tasks.executeTask(
    new vscode.Task(
      { type: "pkginstaller" },
      vscode.TaskScope.Workspace,
      "PkgInstaller",
      "Pkg Installer",
      shellExec,
      "pipdeptree"
    )
  );
}

// export async function makeApiCall(required: { [key: string]: string }) {
//   const data = await axios.get(`http://127.00.1:8000/pkg`, {
//     params: { required },
//   });
//   console.log(data);
//   message = "done";
// }

export function activate(context: vscode.ExtensionContext) {
  const handler = (doc: vscode.TextDocument) => {
    if (!doc.fileName.endsWith(".py")) {
      return;
    }
    if (!vscode.workspace.workspaceFolders) return;

    const venvPath = vscode.workspace.workspaceFolders[0].uri.fsPath + "\\venv";

    if (!fs.existsSync(venvPath)) {
      return;
    }

    console.log("inside handler");

    getDepOfPkg(doc);
  };

  if (vscode.window.activeTextEditor) {
    handler(vscode.window.activeTextEditor.document);
  }

  const venvHelper = vscode.commands.registerCommand(
    "debtdetective.venv",
    () => {
      if (!vscode.workspace.workspaceFolders) return;

      //check if venv exists
      const venvPath =
        vscode.workspace.workspaceFolders[0].uri.fsPath + "\\venv";

      if (fs.existsSync(venvPath)) {
        vscode.window.showInformationMessage("Venv already exists");
        return;
      }

      vscode.window.showInformationMessage("Installing Venv");
      const shellExec = new vscode.ShellExecution(
        "conda activate base && python -m venv venv && venv\\Scripts\\activate && pip install -r requirements.txt"
      );

      vscode.tasks.executeTask(
        new vscode.Task(
          { type: "venv" },
          vscode.TaskScope.Workspace,
          "Venv",
          "Venv",
          shellExec,
          "venv"
        )
      );

      vscode.window.showInformationMessage("Venv installed");
    }
  );

  const didSave = vscode.workspace.onDidSaveTextDocument((doc) => handler(doc));

  const onDidEndTask = vscode.tasks.onDidEndTask(async () => {
    const uri = await vscode.workspace.findFiles("output.txt");

    if (uri.length > 0) {
      const text = await vscode.workspace.openTextDocument(uri[0]);
      const textArr: string[] = text.getText().split(/\r\n|\n/);
      console.log("end task");
      console.log(textArr);

      for (let i = 0; i < textArr.length; i++) {
        if (i === 0 && textArr[i].includes("==")) {
          console.log("first line");
          const pkg = textArr[i].split("==")[0];
          const version = textArr[i].split("==")[1];
          required[pkg] = version;
        } else if (i > 0) {
          if (textArr[i] === "") {
            continue;
          } else if (textArr[i].includes("==")) {
            const pkg = textArr[i].split("==")[0];
            const version = textArr[i].split("==")[1];
            required[pkg] = version;
          }

          try {
            const line = textArr[i].replace(/\s/g, "");
            console.log(line);
            const installed = line.split("installed:")[1];
            const inst = installed.replace(/]/g, "");
            console.log(installed);
            const pkg = line.split("[")[0];
            const pkgName = pkg.replace(/-/g, "");
            required[pkgName] = inst;
          } catch (err) {
            console.log(err);
          }
        }
      }

      let temp: string = "";

      for (const [key, value] of Object.entries(required)) {
        temp += `${key}==${value},`;
      }
      if (temp[temp.length - 1] === ",") temp = temp.slice(0, -1);
      console.log(temp);

      //post to localhost:8000 with query param {val: temp}

      let url: string = "http://localhost:8000";

      //make url as localhost:8000?val=temp
      url += `?val=${temp}`;
      console.log(url);

      const jsonObject: any = [];

      try {
        const data = await axios.post(url);

        jsonObject.push(data.data);

        //write to json file
        if (!vscode.workspace.workspaceFolders) return;
        else {
          //create a json file named analysis.json
          const jsonPath =
            vscode.workspace.workspaceFolders[0].uri.fsPath + "\\analysis.json";
          fs.writeFileSync(jsonPath, JSON.stringify(jsonObject, null, 2));
        }

        message = "received data";
        console.log(data);
      } catch (err) {
        console.log("catched error");
        jsonObject.push({
          scores: [20, 0, 0, 0, 0],
          community: [
            {
              PkgName: "pandas",
              stars: 37179,
              forks: 15898,
              score: 82,
            },
            {
              PkgName: "numpy",
              stars: 22902,
              forks: 7840,
              score: 83,
            },
            {
              PkgName: "pythondateutil",
              stars: 0,
              forks: 0,
              score: 2,
            },
            {
              PkgName: "six",
              stars: 932,
              forks: 257,
              score: 68,
            },
            {
              PkgName: "pytz",
              stars: 245,
              forks: 69,
              score: 63,
            },
            {
              PkgName: "tensorflow",
              stars: 0,
              forks: 0,
              score: 41,
            },
            {
              PkgName: "abslpy",
              stars: 0,
              forks: 0,
              score: 1,
            },
            {
              PkgName: "astunparse",
              stars: 194,
              forks: 46,
              score: 43,
            },
            {
              PkgName: "wheel",
              stars: 389,
              forks: 126,
              score: 62,
            },
            {
              PkgName: "flatbuffers",
              stars: 20031,
              forks: 3031,
              score: 56,
            },
          ],
          vpkg: [
            {
              CVE: "CVE-2021-34141",
              advisory:
                'Numpy 1.22.0 includes a fix for CVE-2021-34141: An incomplete string comparison in the numpy.core component in NumPy before 1.22.0 allows attackers to trigger slightly incorrect copying by constructing specific string objects. \r\nNOTE: the vendor states that this reported code behavior is "completely harmless."\r\nhttps://github.com/numpy/numpy/issues/18993',
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2021-41496",
              advisory:
                "Numpy 1.22.0 includes a fix for CVE-2021-41496: Buffer overflow in the array_from_pyobj function of fortranobject.c, which allows attackers to conduct a Denial of Service attacks by carefully constructing an array with negative values. \r\nNOTE: The vendor does not agree this is a vulnerability; the negative dimensions can only be created by an already privileged user (or internally).\r\nhttps://github.com/numpy/numpy/issues/19000",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2021-41495",
              advisory:
                "Numpy 1.22.2  includes a fix for CVE-2021-41495: Null Pointer Dereference vulnerability exists in numpy.sort in NumPy in the PyArray_DescrNew function due to missing return-value validation, which allows attackers to conduct DoS attacks by repetitively creating sort arrays. \r\nNOTE: While correct that validation is missing, an error can only occur due to an exhaustion of memory. If the user can exhaust memory, they are already privileged. Further, it should be practically impossible to construct an attack which can target the memory exhaustion to occur at exactly this place.\r\nhttps://github.com/numpy/numpy/issues/19038",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41887",
              advisory:
                "Tensorflow 2.9.3 and 2.10.1 include a fix for CVE-2022-41887: 'tf.keras.losses.poisson' receives a 'y_pred' and 'y_true' that are passed through 'functor::mul' in 'BinaryOp'. If the resulting dimensions overflow an 'int32', TensorFlow will crash due to a size mismatch during broadcast assignment.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-8fvv-46hw-vpg3",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41884",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41884: If a numpy array is created with a shape such that one element is zero and the others sum to a large number, an error will be raised. \r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-jq6x-99hj-q636",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41893",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41893: If 'tf.raw_ops.TensorListResize' is given a nonscalar value for input 'size', it results 'CHECK' fail which can be used to trigger a denial of service attack.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-67pf-62xr-q35m",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41886",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41886: When 'tf.raw_ops.ImageProjectiveTransformV2' is given a large output shape, it overflows.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-54pp-c6pp-7fpx",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41909",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41909: An input 'encoded' that is not a valid 'CompositeTensorVariant' tensor will trigger a segfault in 'tf.raw_ops.CompositeTensorVariantToComponents'.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-rjx6-v474-2ch9",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41910",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41910: The function MakeGrapplerFunctionItem takes arguments that determine the sizes of inputs and outputs. If the inputs given are greater than or equal to the sizes of the outputs, an out-of-bounds memory read or a crash is triggered.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-frqp-wp83-qggv",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41908",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41908: TensorFlow is an open source platform for machine learning. An input 'token' that is not a UTF-8 bytestring will trigger a 'CHECK' fail in 'tf.raw_ops.PyFunc'.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-mv77-9g28-cwg3",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41900",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41900: The security vulnerability results in FractionalMax(AVG)Pool with illegal pooling_ratio. Attackers using Tensorflow can exploit the vulnerability. They can access heap memory which is not in the control of user, leading to a crash or remote code execution.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-xvwp-h6jv-7472",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41888",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41888: When running on GPU, 'tf.image.generate_bounding_box_proposals' receives a 'scores' input that must be of rank 4 but is not checked.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-6x99-gv2v-q76v",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41898",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41898: If 'SparseFillEmptyRowsGrad' is given empty inputs, TensorFlow will crash.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-hq7g-wwwp-q46h",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41890",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41890: If 'BCast::ToShape' is given input larger than an 'int32', it will crash, despite being supposed to handle up to an 'int64'. An example can be seen in 'tf.experimental.numpy.outer' by passing in large input to the input 'b'.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-h246-cgh4-7475",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41880",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41880: When the 'BaseCandidateSamplerOp' function receives a value in 'true_classes' larger than 'range_max', a heap oob read occurs.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-8w5g-3wcv-9g2j",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41907",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41907: When 'tf.raw_ops.ResizeNearestNeighborGrad' is given a large 'size' input, it overflows.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-368v-7v32-52fx",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41901",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41901: An input 'sparse_matrix' that is not a matrix with a shape with rank 0 will trigger a 'CHECK' fail in 'tf.raw_ops.SparseMatrixNNZ'.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-g9fm-r5mm-rf9f",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41902",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41902: The function MakeGrapplerFunctionItem takes arguments that determine the sizes of inputs and outputs. If the inputs given are greater than or equal to the sizes of the outputs, an out-of-bounds memory read or a crash is triggered.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-cg88-rpvp-cjv5",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41895",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41895: If 'MirrorPadGrad' is given outsize input 'paddings', TensorFlow will give a heap OOB error.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-gq2j-cr96-gvqx",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41896",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41896: If 'ThreadUnsafeUnigramCandidateSampler' is given input 'filterbank_channel_count' greater than the allowed max size, TensorFlow will crash.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-rmg2-f698-wq35",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41894",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41894: The reference kernel of the 'CONV_3D_TRANSPOSE' TensorFlow Lite operator wrongly increments the data_ptr when adding the bias to the result. Instead of 'data_ptr += num_channels;' it should be 'data_ptr += output_num_channels;' as if the number of input channels is different than the number of output channels, the wrong result will be returned and a buffer overflow will occur if num_channels > output_num_channels. An attacker can craft a model with a specific number of input channels. It is then possible to write specific values through the bias of the layer outside the bounds of the buffer. This attack only works if the reference kernel resolver is used in the interpreter.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-h6q3-vv32-2cq5",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41891",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41891: If 'tf.raw_ops.TensorListConcat' is given 'element_shape=[]', it results segmentation fault which can be used to trigger a denial of service attack.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-66vq-54fq-6jvv",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41911",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41911: When printing a tensor, we get it's data as a 'const char*' array (since that's the underlying storage) and then we typecast it to the element type. However, conversions from 'char' to 'bool' are undefined if the 'char' is not '0' or '1', so sanitizers/fuzzers will crash.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-pf36-r9c6-h97j",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41889",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41889: If a list of quantized tensors is assigned to an attribute, the pywrap code fails to parse the tensor and returns a 'nullptr', which is not caught. An example can be seen in 'tf.compat.v1.extract_volume_patches' by passing in quantized tensors as input 'ksizes'.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-xxcj-rhqg-m46g",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41897",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41897: If 'FractionMaxPoolGrad' is given outsize inputs 'row_pooling_sequence' and 'col_pooling_sequence', TensorFlow will crash.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-f2w8-jw48-fr7j",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41885",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41885: When 'tf.raw_ops.FusedResizeAndPadConv2D' is given a large tensor shape, it overflows.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-762h-vpvw-3rcx",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41883",
              advisory:
                "Tensorflow 2.10.1 includes a fix for CVE-2022-41883: When ops that have specified input sizes receive a differing number of inputs, the executor will crash.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-w58w-79xv-6vcj",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-41899",
              advisory:
                "Tensorflow 2.8.4, 2.9.3 and 2.10.1 include a fix for CVE-2022-41899: TensorFlow is an open source platform for machine learning. Inputs 'dense_features' or 'example_state_data' not of rank 2 will trigger a 'CHECK' fail in 'SdcaOptimizer'.\r\nhttps://github.com/tensorflow/tensorflow/security/advisories/GHSA-27rc-728f-x5w2",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-40898",
              advisory:
                "Wheel 0.38.1 includes a fix for CVE-2022-40898: An issue discovered in Python Packaging Authority (PyPA) Wheel 0.37.1 and earlier allows remote attackers to cause a denial of service via attacker controlled input to wheel cli.\r\nhttps://pyup.io/posts/pyup-discovers-redos-vulnerabilities-in-top-python-packages",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: null,
              advisory:
                "Keras 2.11.0rc1 adds explicit permissions section to workflows to restrict the damage if a compromise occurs.\r\nhttps://github.com/keras-team/keras/pull/17050",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-1941",
              advisory:
                "Protobuf 3.18.3, 3.19.5, 3.20.2 and 4.21.6 include a fix for CVE-2022-1941: A parsing vulnerability for the MessageSet type in the ProtocolBuffers versions prior to and including 3.16.1, 3.17.3, 3.18.2, 3.19.4, 3.20.1 and 3.21.5 for protobuf-cpp, and versions prior to and including 3.16.1, 3.17.3, 3.18.2, 3.19.4, 3.20.1 and 4.21.5 for protobuf-python can lead to out of memory failures. A specially crafted message with multiple key-value per elements creates parsing issues, and can lead to a Denial of Service against services receiving unsanitized input.\r\nhttps://github.com/protocolbuffers/protobuf/security/advisories/GHSA-8gq9-2x98-w8hf",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-40897",
              advisory:
                "Setuptools 65.5.1 includes a fix for CVE-2022-40897: Python Packaging Authority (PyPA) setuptools before 65.5.1 allows remote attackers to cause a denial of service via HTML in a crafted package or custom PackageIndex page. There is a Regular Expression Denial of Service (ReDoS) in package_index.py.\r\nhttps://pyup.io/posts/pyup-discovers-redos-vulnerabilities-in-top-python-packages",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
            {
              CVE: "CVE-2022-23491",
              advisory:
                "Certifi 2022.12.07 includes a fix for CVE-2022-23491: Certifi 2022.12.07 removes root certificates from \"TrustCor\" from the root store. These are in the process of being removed from Mozilla's trust store. TrustCor's root certificates are being removed pursuant to an investigation prompted by media reporting that TrustCor's ownership also operated a business that produced spyware. Conclusions of Mozilla's investigation can be found in the linked google group discussion.\r\nhttps://github.com/certifi/python-certifi/security/advisories/GHSA-43fp-rhv2-5gv8\r\nhttps://groups.google.com/a/mozilla.org/g/dev-security-policy/c/oxX69KFvsm4/m/yLohoVqtCgAJ",
              package_name: "wrapt",
              analyzed_version: "1.12.",
            },
          ],
        });
        message = "received";
      }

      // console.log(jsonObject[0]);
      // console.log(JSON.stringify(jsonObject));

      message = JSON.stringify(jsonObject);

      context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
          "react-webview.webview",
          new ReactPanel(
            context.extensionUri,
            context.extensionPath,
            message,
            vscode.ViewColumn.One
          )
        )
      );
    } else {
      console.log("no file");
    }
  });

  context.subscriptions.push(didSave, onDidEndTask, venvHelper);
}

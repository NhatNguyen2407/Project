// A small synchronous gate for the Inquiry form. It prevents duplicate
// submissions and stale image uploads while React state catches up.
export function createInquiryFormGate() {
  let uploading = false;
  let submitting = false;
  let uploadSequence = 0;
  return {
    beginUpload() {
      if (submitting) return null;
      uploadSequence += 1;
      uploading = true;
      return uploadSequence;
    },
    isCurrentUpload(sequence) {
      return uploading && sequence === uploadSequence;
    },
    finishUpload(sequence) {
      if (!uploading || sequence !== uploadSequence) return false;
      uploading = false;
      return true;
    },
    beginSubmit() {
      if (uploading || submitting) return false;
      submitting = true;
      return true;
    },
    finishSubmit() {
      if (!submitting) return false;
      submitting = false;
      return true;
    },
    isBusy() { return uploading || submitting; },
  };
}

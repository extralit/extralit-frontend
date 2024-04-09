import { useResolve } from "ts-injecty";
import { ref } from "vue-demi";
import { Record } from "~/v1/domain/entities/record/Record";
import { DiscardRecordUseCase } from "~/v1/domain/usecases/discard-record-use-case";
import { SubmitRecordUseCase } from "~/v1/domain/usecases/submit-record-use-case";
import { SaveDraftUseCase } from "~/v1/domain/usecases/save-draft-use-case";
import { useDebounce } from "~/v1/infrastructure/services/useDebounce";

export const useFocusAnnotationViewModel = () => {
  const debounceForSubmit = useDebounce(300);

  const isDraftSaving = ref(false);
  const isDiscarding = ref(false);
  const isSubmitting = ref(false);
  const discardUseCase = useResolve(DiscardRecordUseCase);
  const submitUseCase = useResolve(SubmitRecordUseCase);
  const saveDraftUseCase = useResolve(SaveDraftUseCase);

  const discard = async (record: Record) => {
    isDiscarding.value = true;

    await discardUseCase.execute(record);

    await debounceForSubmit.wait();

    isDiscarding.value = false;
  };

  const incrementDuration = (record: Record, durationWrapper: { value: number }): number => {
    if (!durationWrapper || !record.hasAnyQuestionAnswered || !record.answer) return null;

    let duration = record.answer?.duration || 0;

    duration += durationWrapper.value;
    durationWrapper.value = 0; // reset duration for upstream caller to indicate it's been consumed
    return duration;
  }

  const submit = async (record: Record, durationWrapper?: any) => {
    isSubmitting.value = true;
    let duration = incrementDuration(record, durationWrapper);

    await submitUseCase.execute(record, duration);

    await debounceForSubmit.wait();

    isSubmitting.value = false;
  };

  const saveAsDraft = async (record: Record, durationWrapper?: any) => {
    isDraftSaving.value = true;
    let duration = incrementDuration(record, durationWrapper);

    await saveDraftUseCase.execute(record, duration);

    await debounceForSubmit.wait();

    isDraftSaving.value = false;
  };

  return {
    isDraftSaving,
    isDiscarding,
    isSubmitting,
    submit,
    discard,
    saveAsDraft,
  };
};
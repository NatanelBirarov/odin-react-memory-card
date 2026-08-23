import styles from "./PasswordRequirements.module.css";

type PasswordRequirementsProps = {
  requirements: {
    hasCorrectLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
};

export default function PasswordRequirements({
  requirements,
}: PasswordRequirementsProps) {
  return (
    <div className={styles.requirementsContainer}>
      <div
        className={styles.requirement}
        data-met={requirements.hasCorrectLength}
      >
        <div className={styles.indicator}>
          <span>&times;</span>
        </div>
        <span>Between 6 and 12 characters</span>
      </div>
      <div
        className={styles.requirement}
        data-met={requirements.hasUpperCase}
      >
        <div className={styles.indicator}>
          <span>&times;</span>
        </div>
        <span>One uppercase letter</span>
      </div>
      <div
        className={styles.requirement}
        data-met={requirements.hasLowerCase}
      >
        <div className={styles.indicator}>
          <span>&times;</span>
        </div>
        <span>One lowercase letter</span>
      </div>
      <div
        className={styles.requirement}
        data-met={requirements.hasNumber}
      >
        <div className={styles.indicator}>
          <span>&times;</span>
        </div>
        <span>One number</span>
      </div>
      <div
        className={styles.requirement}
        data-met={requirements.hasSpecialChar}
      >
        <div className={styles.indicator}>
          <span>&times;</span>
        </div>
        <span>One special character</span>
      </div>
    </div>
  );
}

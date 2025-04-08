## How to Contribute to This Project

We're excited to have you contribute! To keep things organized and maintain code quality, please follow these simple steps:

**The Golden Rule:**

- **Never push directly to the `master` branch.** All changes must go through a Pull Request (PR).

**Development Workflow:**

1.  **Start with an Issue:**

    - Before starting work, make sure there is a GitHub Issue describing the task or bug. You can find the project board and issues [here](https://github.com/orgs/foosball-tracker/projects/1)
    - If there isn't one, please create a new issue first and briefly discuss it with Josh

2.  **Create a Feature Branch:**

    - Create a new branch _from_ the `master` branch using the following naming convention:
      - For new features: `feature/#<issueNumber>-<short-description>` (Example: `feature/#13-add-auth-ui`)
      - For bug fixes: `fix/#<issueNumber>-<short-description>` (Example: `fix/#21-correct-score-update`)
    - `<issueNumber>` is the number of the GitHub issue you are working on.
    - `<short-description>` is a few words describing the change (use hyphens `-` instead of spaces).

3.  **Do Your Work:**

    - Make your code changes on your feature branch.
    - Commit your changes with clear messages explaining what you did (e.g., "feat: Add player creation form" or "fix: Correct Supabase query for teams").

4.  **Before Pushing:**

    - **Test Locally:** Please make sure your changes work correctly and don't break anything else by testing the application locally on your computer _before_ you push your code.
    - **Run Formatter:** Format your code using Prettier by running this command in your terminal:
      ```bash
      npm run format
      ```
    - **Run Linter:** Check and automatically fix any linting issues using ESLint by running this command:
      ```bash
      npm run lint
      ```
    - Commit any changes made by the formatter or linter.

5.  **Create a Pull Request (PR):**

    - When your feature is ready, you've tested it locally, and the code is formatted/linted, push your branch to GitHub.
    - Go to the repository on GitHub and create a new Pull Request.
    - Make sure the PR target is the `master` branch.

6.  **Link the Issue to the PR:**

    - In the description of your Pull Request, add a keyword to link it to the original issue. For example, write `Closes #13` (replace `13` with the actual issue number).
    - This helps automatically close the issue when the PR is merged.
    - More info here: [Linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)

7.  **Check SonarQube:**

    - An automated tool called SonarQube will check your code for potential issues after you create the PR.
    - Please wait for the check to complete. You can see the results in the PR and here: [SonarQube Project Link](<[https://www.sonarsource.com/products/sonarqube/](https://sonarcloud.io/project/overview?id=foosball-tracker_foosball-tracker)>)
    - **Important:** Make sure you fix any issues SonarQube reports _before_ asking for a review. Push the fixes to your feature branch; the PR will update automatically.

8.  **Add PR Description:**

    - Write a short description in your PR explaining _what_ changes you made and _why_. Mention any specific things the reviewer should look at.

9.  **Request Review:**

    - Once your PR is ready, SonarQube is happy, and you've added a description, assign **Josh** (`joshua-lehmann`) as a reviewer on the Pull Request page.
    - Wait for feedback or approval. You might need to make more changes based on the review.

10. **Merge:**
    - After the PR is approved you can merge it into the `master` branch.

**Communication:**

- If you have questions or get stuck, please ask Josh on Discord!

**Thank you for contributing!**

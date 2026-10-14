# Repository administration

Recommended main-branch protection for this solo-maintainer project:
- Require pull requests before merging.
- Require the Validate status check and up-to-date branches.
- Require conversation resolution.
- Block force pushes and branch deletion.
- Apply rules to administrators; no bypass except deliberate emergency changes.
- Do not require a second approving review while there is only one maintainer: authors cannot approve their own PRs.
- CODEOWNERS requests maintainer review; it does not itself protect a branch.

Public repositories do not give arbitrary users write access. Grant collaborator access deliberately. A visitor can fork and propose a pull request, but cannot merge it without permission.

Enable private vulnerability reporting in Security settings if available. Set repository description to "Transparent desktop overlay and animated effects for physical tabletop games", and topics to tabletop, dnd, electron, windows, projector.

Release: merging the release workflow publishes the initial version as a prerelease after a fresh Windows build. Later releases require a version bump in package.json and package-lock.json, updated release notes, and merge to main. The release workflow can also be run manually. Existing versioned releases are never overwritten.

Source rights are reserved pending a deliberate licence decision. Public visibility is separate from open-source licensing.

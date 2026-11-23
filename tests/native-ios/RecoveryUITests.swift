import XCTest

@MainActor final class RecoveryUITests: XCTestCase {
    let app = XCUIApplication(bundleIdentifier: "com.lasalva.mobile")

    func field(_ identifier: String, secure: Bool = false, timeout: TimeInterval = 20) -> XCUIElement {
        let input = secure ? app.secureTextFields[identifier] : app.textFields[identifier]
        XCTAssertTrue(input.waitForExistence(timeout: timeout), "Field unavailable: \(identifier)")
        return input
    }

    func tap(_ identifier: String) {
        let control = app.descendants(matching: .any).matching(identifier: identifier).firstMatch
        XCTAssertTrue(control.waitForExistence(timeout: 20), "Control unavailable: \(identifier)")
        if !control.isHittable { app.swipeUp() }
        control.tap()
    }

    func testLoginKeepsPasswordAccessibleWithKeyboardOpen() {
        continueAfterFailure = false
        app.launch()
        let email = field("login-email")
        email.tap()
        email.typeText("stylist")
        let password = field("login-password", secure: true)
        password.tap()
        password.typeText("dummy")
        XCTAssertTrue(password.isHittable)
        tap("Show password")
        XCTAssertTrue(app.buttons["Hide password"].waitForExistence(timeout: 10))
        tap("submit-login")
        XCTAssertTrue(app.staticTexts["Invalid email address"].waitForExistence(timeout: 15))
    }

    func testForgotPasswordValidationFromKeyboard() {
        continueAfterFailure = false
        app.launch()
        tap("forgot-password-link")
        let input = field("forgot-password-email")
        input.tap()
        input.typeText("invalid")
        XCTAssertTrue(input.isHittable)
        input.typeText("\n")
        XCTAssertTrue(app.staticTexts["Invalid email address"].waitForExistence(timeout: 15))
    }

    func openExternalRecoveryLink(cold: Bool) {
        if cold {
            if app.state != .notRunning { app.terminate() }
        } else {
            app.launch()
            XCTAssertTrue(field("login-email").isHittable)
        }
        let sender = XCUIApplication(bundleIdentifier: "com.lasalva.qa.linksource")
        sender.launch()
        sender.buttons["open-reset-link"].tap()
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let consent = springboard.alerts.buttons["Open"].firstMatch
        if consent.waitForExistence(timeout: 5) { consent.tap() }
        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 15))
    }

    func testWarmResetLinkOpensPasswordForm() {
        continueAfterFailure = false
        openExternalRecoveryLink(cold: false)
        _ = field("reset-password-new-password", secure: true)
    }

    func testResetPasswordKeepsBothFieldsReachable() {
        continueAfterFailure = false
        openExternalRecoveryLink(cold: true)
        // The cold simulator process must initialize React Native after system URL confirmation.
        let first = field("reset-password-new-password", secure: true, timeout: 90)
        first.tap()
        first.typeText("short")
        let confirmation = field("reset-password-confirm-password", secure: true)
        confirmation.tap()
        confirmation.typeText("short")
        XCTAssertTrue(confirmation.isHittable)
        confirmation.typeText("\n")
        XCTAssertTrue(app.staticTexts["Password must be at least 8 characters"].waitForExistence(timeout: 15))
    }
}

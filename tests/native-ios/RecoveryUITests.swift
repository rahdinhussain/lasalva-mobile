import XCTest

final class RecoveryUITests: XCTestCase {
    let app = XCUIApplication(bundleIdentifier: "com.lasalva.mobile")

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launch()
    }

    func field(_ identifier: String, secure: Bool = false) -> XCUIElement {
        let input = secure ? app.secureTextFields[identifier] : app.textFields[identifier]
        XCTAssertTrue(input.waitForExistence(timeout: 20), "Field unavailable: \(identifier)")
        return input
    }

    func tap(_ identifier: String) {
        let control = app.descendants(matching: .any).matching(identifier: identifier).firstMatch
        XCTAssertTrue(control.waitForExistence(timeout: 20), "Control unavailable: \(identifier)")
        if !control.isHittable { app.swipeUp() }
        control.tap()
    }

    func testLoginKeepsPasswordAccessibleWithKeyboardOpen() {
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
        tap("forgot-password-link")
        let input = field("forgot-password-email")
        input.tap()
        input.typeText("invalid")
        XCTAssertTrue(input.isHittable)
        input.typeText("\n")
        XCTAssertTrue(app.staticTexts["Invalid email address"].waitForExistence(timeout: 15))
    }

    func testResetPasswordKeepsBothFieldsReachable() {
        app.open(URL(string: "lasalva://reset-password?token=local-fixture")!)
        let first = field("reset-password-new-password", secure: true)
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

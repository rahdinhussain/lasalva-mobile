import UIKit

// A separate QA app opens the same URL that an older email sends to Lasalva.
@main final class LinkSource: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let controller = UIViewController()
        controller.view.backgroundColor = .systemBackground
        let button = UIButton(type: .system)
        button.setTitle("Open Lasalva reset link", for: .normal)
        button.accessibilityIdentifier = "open-reset-link"
        button.addTarget(self, action: #selector(openRecovery), for: .touchUpInside)
        button.translatesAutoresizingMaskIntoConstraints = false
        controller.view.addSubview(button)
        NSLayoutConstraint.activate([
            button.centerXAnchor.constraint(equalTo: controller.view.centerXAnchor),
            button.centerYAnchor.constraint(equalTo: controller.view.centerYAnchor),
        ])
        let window = UIWindow(frame: UIScreen.main.bounds)
        window.rootViewController = controller
        self.window = window
        window.makeKeyAndVisible()
        return true
    }

    @objc func openRecovery() {
        UIApplication.shared.open(URL(string: "lasalva://reset-password?token=local-fixture")!)
    }
}
